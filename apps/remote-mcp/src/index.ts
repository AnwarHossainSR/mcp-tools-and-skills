import { createClerkClient } from '@clerk/backend';
import { generateClerkProtectedResourceMetadata } from '@clerk/mcp-tools/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { sendTelegramMessage, telegramMessageInputSchema } from '@sendkit/core';
import { Hono, type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkPublishableKey || !clerkSecretKey) {
  throw new Error(
    'CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are required. Configure them in the environment.',
  );
}

const clerkClient = createClerkClient({
  publishableKey: clerkPublishableKey,
  secretKey: clerkSecretKey,
});

function createServer(botToken: string): McpServer {
  const server = new McpServer({
    name: 'sendkit-remote',
    version: '0.0.0',
  });

  server.registerTool(
    'telegram',
    {
      title: 'Telegram',
      description: 'Send a Telegram message',
      inputSchema: telegramMessageInputSchema.shape,
    },
    async (input) => {
      const result = await sendTelegramMessage({
        ...input,
        botToken,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Sent Telegram message with message ID ${result.messageId} to chat ${result.chatId}`,
          },
        ],
        structuredContent: result,
      };
    },
  );

  return server;
}

// URL of the protected-resource metadata endpoint for a given bot token.
function protectedResourceMetadataUrl(c: Context, botToken: string): string {
  return new URL(
    `/.well-known/oauth-protected-resource/${botToken}/mcp`,
    c.req.url,
  ).toString();
}

// Per MCP auth spec: respond 401 + WWW-Authenticate pointing the client at the
// protected-resource metadata so it can discover where to authenticate.
function unauthorizedMcpResponse(c: Context, botToken: string): HTTPException {
  return new HTTPException(401, {
    res: c.json({ error: 'Unauthorized' }, 401, {
      'WWW-Authenticate': `Bearer resource_metadata="${protectedResourceMetadataUrl(c, botToken)}"`,
    }),
  });
}

const app = new Hono();

// Metadata endpoint the MCP client reads to discover the OAuth server (Clerk).
app.get('/.well-known/oauth-protected-resource/:botToken/mcp', (c) => {
  const botToken = c.req.param('botToken');
  return c.json(
    generateClerkProtectedResourceMetadata({
      publishableKey: clerkPublishableKey,
      resourceUrl: new URL(`/${botToken}/mcp`, c.req.url).toString(),
    }),
  );
});

app.post('/:botToken/mcp', async (c) => {
  const botToken = c.req.param('botToken');

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw unauthorizedMcpResponse(c, botToken);
  }

  try {
    const requestState = await clerkClient.authenticateRequest(c.req.raw, {
      acceptsToken: 'oauth_token',
    });
    if (!requestState.isAuthenticated) {
      throw unauthorizedMcpResponse(c, botToken);
    }
  } catch {
    throw unauthorizedMcpResponse(c, botToken);
  }

  const server = createServer(botToken);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(c.req.raw);
  } finally {
    await server.close();
  }
});

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

const port = Number(process.env.PORT) || 3000;

// Force the public protocol/host onto the request URL. Behind a proxy/tunnel
// the inbound URL is often http://localhost; OAuth redirect URLs must stay
// https or the handshake breaks, so rebuild the request from forwarded headers.
function fetch(request: Request, server: unknown): Response | Promise<Response> {
  const url = new URL(request.url);
  url.protocol = request.headers.get('x-forwarded-proto') ?? url.protocol;
  url.host = request.headers.get('x-forwarded-host') ?? url.host;
  return app.fetch(new Request(url, request), server);
}

export default {
  port,
  fetch,
};
