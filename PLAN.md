# SendKit — Build Plan

A multi-channel "send a message" toolkit, exposed through every interface that
matters: a human-facing CLI, a local MCP server (stdio), a remote MCP server
(HTTP + OAuth), and an agent skill. All adapters delegate to one shared core so
the actual sending logic is written once.

Telegram is the first channel. The architecture is built so additional channels
(email, Slack, SMS, …) drop into the same core later.

---

## Architecture

```
Consumers            Adapters                       Shared Core          External
─────────            ────────                       ───────────          ────────
Human        ─runs→  CLI (sendkit telegram)  ─┐
AI Agent     ─stdio→ Local MCP Server        ─┤
Remote Client─HTTP→  Remote MCP Server        ┼→  sendkit-core      ─→  Telegram
                     (Hono + Bun, OAuth)      ┘   • Zod schemas          Bot API
                     Skill (agent guides) ┄┄┄┘    • sendTelegramMessage()  sendMessage
                                                  • type exports
```

### Layers

- **Shared Core (`@anwarhossainsr/sendkit-core`)** — single source of truth. Zod input
  schemas, the `sendTelegramMessage()` function that calls the Telegram Bot
  API, and exported types. No adapter talks to Telegram directly; they all go
  through core.
- **Adapters** — thin wrappers that translate their transport into a core call:
  - **CLI** (`@anwarhossainsr/sendkit`) — `sendkit telegram <chatId> <message>`. Human use.
  - **Local MCP Server** — stdio transport. For AI agents running locally
    (Claude Desktop, etc.).
  - **Remote MCP Server** (`apps/remote-mcp`) — Hono on Bun, `POST /mcp`,
    Bearer token / OAuth. For remote MCP clients.
  - **Skill** (`sendkit-skill`) — natural-language instructions that teach an
    agent how/when to use the tools.
- **External** — Telegram Bot API.

---

## Current State

- [x] Monorepo: Bun workspaces, root `tsconfig.json`, `packages/*`.
- [x] CLI package scaffolded (`@anwarhossainsr/sendkit`, commander).
- [x] CLI `telegram` command sends a real message via the Telegram Bot API
      (`TELEGRAM_BOT_TOKEN` from env).
- [x] `.env` git-ignored; `.env.example` present.

> The CLI currently inlines `sendTelegramMessage()`. Step 1 below extracts it
> into the shared core and makes the CLI consume it.

---

## Build Order

Mirrors the video walkthrough (`subtitle.md` at repo root is the transcript —
no per-line timestamps, but content is sequential and matches the markers
below). Each step ships something runnable.

> **Process:** before implementing a step, grep `subtitle.md` for that
> section's keywords (tool/file names, e.g. `"create server"`, `"bot token"`,
> `"register tool"`) and read that range first. The transcript pins down
> exact schema/function names, file layout, and ordering the video uses —
> match it unless there's a concrete reason to diverge (and note the
> divergence here). This is how Step 1 was corrected: an initial pass used a
> `{ ok, error }` return + separate `token` option; re-reading the transcript
> showed core throws `Error` and takes one `{ chatId, message, botToken }`
> object — the plan below already reflects the corrected version.

| Step                    | Video timestamp |
| ----------------------- | --------------- |
| 1. Shared Core          | 00:39:34        |
| 2. Local MCP            | 01:09:18        |
| 3. Remote MCP           | 01:36:38        |
| 4. OAuth                | 01:57:54        |
| 5. CLI Config           | 02:21:55        |
| 6. Formatting & Linting | 02:37:35        |
| 7. Bundling             | 02:48:27        |
| 8. Publishing           | 03:03:03        |
| 9. Deploying OAuth      | 03:35:02        |
| 10. Skill               | 03:37:46        |

### 1. Shared Core — `@anwarhossainsr/sendkit-core` ✅ (00:39:34)

**Goal:** one place that owns the Telegram logic + validation.

- [x] New package `packages/core` (`@anwarhossainsr/sendkit-core`), its own `tsconfig.json`
      extending root.
- [x] Add `zod` dependency.
- [x] `schemas.ts` — `telegramMessageInputSchema` (chatId, message),
      `telegramMessageOptionsSchema` (+ botToken), request/response schemas for
      the Telegram API shape, `telegramMessageOutputSchema`, and their inferred
      types (`TelegramMessageInput`, `TelegramMessageOptions`,
      `TelegramMessageOutput`).
- [x] `operations.ts` — `sendTelegramMessage(input: TelegramMessageOptions)`:
      parses input, parses the outgoing request body, calls
      `https://api.telegram.org/bot<token>/sendMessage`, parses the response,
      and **throws** on invalid input or a failed request — never calls
      `process.exit`, never reads `process.env` (token comes in via `input`).
- [x] `index.ts` re-exports everything from `schemas` + `operations`;
      `package.json` `exports: { ".": "./src/index.ts" }` so consumers just
      `import { sendTelegramMessage } from '@anwarhossainsr/sendkit-core'`.
- [x] Refactor CLI to import core and call it in a `try/catch`; CLI resolves
      `TELEGRAM_BOT_TOKEN` from env and owns all `process.exit` /
      `console.error` handling — core stays pure and environment-agnostic so
      the same operation can be reused by local MCP, remote MCP, etc.

Verified: `tsc --noEmit` passes for core + cli; `bun run dev:cli telegram …`
loads the token, validates with Zod, calls the API, and surfaces Telegram's
own error message via the thrown `Error`.

### 2. Local MCP Server (stdio) ✅ (01:09:18)

**Goal:** expose the same capability to local AI agents.

- [x] New package `packages/mcp-local` (`@anwarhossainsr/sendkit-mcp-local`), deps
      `@modelcontextprotocol/sdk@1.29.0` (v1 — still the recommended/latest
      published version), `@anwarhossainsr/sendkit-core` (`workspace:*`), `zod`; own
      `tsconfig.json` extending root.
- [x] `src/index.ts` — `McpServer({ name: 'sendkit-local', version: '0.0.0' })` + `StdioServerTransport`.
- [x] `getTelegramBotToken()` reads `process.env.TELEGRAM_BOT_TOKEN` and
      throws ("Configure it in your MCP client environment") instead of
      pointing at a `.env` file — the local MCP server's env comes from
      whatever MCP client config launches it, not this repo's `.env`.
- [x] Registered `telegram` tool reusing `telegramMessageInputSchema.shape`
      (chatId + message only) as the input schema — `@anwarhossainsr/sendkit-core` schema
      reused verbatim, not redefined.
- [x] Handler calls `sendTelegramMessage({ ...input, botToken: getTelegramBotToken() })`
      and returns `{ content: [{ type: 'text', text: … }], structuredContent: result }`.
- [x] Root script `dev:mcp-local` → `bun packages/mcp-local/src/index.ts`.
- [ ] MCP client config (`mcp.json` / `opencode.json`) — intentionally not
      committed: those files embed the raw bot token and the transcript
      explicitly warns to gitignore them. Documented here instead — wire up
      manually when testing against Claude Code / opencode:
      ```json
      { "mcpServers": { "sendkit": {
        "type": "stdio", "command": "bun", "args": ["run", "dev:mcp-local"],
        "env": { "TELEGRAM_BOT_TOKEN": "<token>" }
      } } }
      ```

Verified: `tsc --noEmit` passes; `bun run dev:mcp-local` starts and hangs
waiting on stdio (no crash) — correct, since it's meant to be driven by an
MCP client, not run directly.

### 3. Remote MCP Server — `apps/remote-mcp` ✅ (01:36:38)

**Goal:** same tool over HTTP for remote clients.

- [x] Re-read `subtitle.md` around "remote MCP" before coding (≈ lines 813–925).
- [x] New `apps/*` workspace glob in root `package.json`; app
      `apps/remote-mcp` (`sendkit-remote-mcp`, private, Hono + Bun) with own
      `tsconfig.json` extending root. Deps: `hono`,
      `@modelcontextprotocol/sdk@1.29.0`, `@anwarhossainsr/sendkit-core` (`workspace:*`),
      `@types/node`.
- [x] `src/index.ts` — `createServer(botToken)` builds an `McpServer`
      (`sendkit-remote`) and registers the `telegram` tool; Hono
      `POST /:botToken/mcp` extracts the token from the URL param, wires a
      `WebStandardStreamableHTTPServerTransport` (`sessionIdGenerator: undefined`,
      `enableJsonResponse: true`), `server.connect(transport)`, then
      `transport.handleRequest(c.req.raw)` in `try` / `server.close()` in
      `finally`. `app.notFound` → 404 JSON. `export default { port, fetch }`,
      `port = PORT ?? 3000`. - **Divergence note:** transcript imports a "web standard streamable HTTP
      server transport" but never names the class; SDK 1.29 exposes it as
      `WebStandardStreamableHTTPServerTransport` from
      `@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js`
      (returns a web `Response` from `handleRequest`, so `c.req.raw` works
      directly with Hono). Token lives in the URL path
      (`/:botToken/mcp`) per the transcript — this is the "first cut", real
      auth (OAuth/Clerk) is Step 4.
- [x] Reuse `@anwarhossainsr/sendkit-core` for the tool (no logic duplication) — handler uses
      the `botToken` arg directly, no `process.env`.
- [x] Root script `dev:remote-mcp` → `bun apps/remote-mcp/src/index.ts`.

Verified: `tsc --noEmit -p apps/remote-mcp/tsconfig.json` passes. Server
boots on `:3000`; root GET → 404; `POST /abc123/mcp` `initialize` → 200 MCP
handshake; `tools/list` returns the `telegram` tool with the core-derived
`{ chatId, message }` input schema.

> Bearer-token middleware deferred: transcript's Step 3 ships the bare server
> (token in URL) and adds real auth in Step 4 (OAuth/Clerk). Kept aligned.

### 4. OAuth — Clerk ✅ (01:57:54)

**Goal:** replace the static bearer token with real auth.

- [x] Re-read `subtitle.md` around "OAuth" (≈ lines 997–1199) before coding —
      transcript uses **Clerk** (not a self-issued/manual OAuth server).
- [x] Deps in `apps/remote-mcp`: `@clerk/backend` (`createClerkClient`,
      `clerkClient.authenticateRequest`), `@clerk/mcp-tools`
      (`generateClerkProtectedResourceMetadata` from
      `@clerk/mcp-tools/server`).
- [x] Read `CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` from env, **throw** at
      boot if either missing; init one `clerkClient`. `.env.example` documents
      both keys.
- [x] Protected-resource metadata endpoint
      `GET /.well-known/oauth-protected-resource/:botToken/mcp` →
      `generateClerkProtectedResourceMetadata({ publishableKey, resourceUrl })`
      (per MCP auth spec / RFC 9728) so the client can discover Clerk.
- [x] Helpers: `protectedResourceMetadataUrl(c, botToken)` and
      `unauthorizedMcpResponse(c, botToken)` → throws a 401 with
      `WWW-Authenticate: Bearer resource_metadata="<url>"`.
- [x] `POST /:botToken/mcp` protected: require `Authorization: Bearer …`, then
      `clerkClient.authenticateRequest(c.req.raw, { acceptsToken: 'oauth_token' })`;
      on missing header / `!isAuthenticated` / any throw → return the 401
      metadata response. Only on success build the MCP server + transport.
- [x] HTTPS-protocol fix: custom `fetch` rewrites `x-forwarded-proto` /
      `x-forwarded-host` onto the request URL before `app.fetch` so OAuth
      redirect URLs stay `https` behind a tunnel/proxy. - **Divergence note:** transcript names are audio-garbled; verified
      against installed types — `createClerkClient`,
      `generateClerkProtectedResourceMetadata` (`@clerk/mcp-tools/server`),
      `authenticateRequest(req, { acceptsToken: 'oauth_token' })`,
      `requestState.isAuthenticated` (`isSignedIn` is deprecated in
      `@clerk/backend@3`). 401 thrown via Hono `HTTPException`.

Verified: `tsc --noEmit -p apps/remote-mcp/tsconfig.json` passes. Boot throws
without Clerk keys. With (dummy) keys: metadata endpoint → 200 protected-
resource JSON; `POST /:botToken/mcp` without a Bearer → 401 +
`WWW-Authenticate: Bearer resource_metadata="…/.well-known/oauth-protected-resource/…/mcp"`.

> Full end-to-end sign-in (Claude/ChatGPT connector → Clerk login → tool call)
> needs a real free Clerk app (email + Google), `Dynamic client registration`
> enabled (Configure → Developers → OAuth applications → Settings), real keys
> in `.env`, and a public HTTPS tunnel/deploy — covered at deploy time
> (Step 9). ChatGPT may need a **user-defined** OAuth client (manual app with
> all scopes incl. `openid`) since its dynamic registration drops scopes.

### 5. CLI Config ✅ (02:21:55)

**Goal:** stop depending on a single ambient `.env`.

- [x] Re-read `subtitle.md` around "CLI config" / "config.json" (≈ lines
      1209–1327) before coding.
- [x] Added `zod` to `@anwarhossainsr/sendkit`. Config lives at
      `join(homedir(), '.config', 'sendkit', 'config.json')`;
      `cliConfigSchema = z.object({ telegramBotToken: z.string().min(1).optional() })`.
- [x] `writeTelegramBotToken(token)` — `mkdirSync(dirname, { recursive: true })`
      then `writeFileSync(configPath, JSON.stringify({ telegramBotToken }, null, 2) + '\n', { mode: 0o600 })`.
- [x] `getTelegramBotToken()` — throws `… Please run \`sendkit init\`.` if the
      file is missing, Zod-parses it, throws again if the token is absent,
      else returns it.
- [x] `sendkit init --telegram-bot-token <token>` (commander
      `requiredOption`, camelCased to `options.telegramBotToken`) writes the
      config and prints the saved path.
- [x] `telegram` command simplified: no env/arg guards, no try/catch; resolves
      the token via `getTelegramBotToken()` and `console.log(JSON.stringify(result))`
      (JSON output is cheaper/clearer for agents). Top-level
      `program.parseAsync(...).catch()` prints `error.message` + `process.exit(1)`.

Verified: `tsc --noEmit -p packages/cli/tsconfig.json` passes. With an empty
home, `telegram 123 hi` → `Telegram bot token is required. Please run
\`sendkit init\`.`; `init --telegram-bot-token …`writes`~/.config/sendkit/config.json` (`{ "telegramBotToken": … }`); `init`with no
flag → commander`required option '--telegram-bot-token <token>' not specified`.

> **Divergence from this plan's original wording:** the transcript implements a
> **config-file-only** source — it removes the `.env`/`process.env` dependency
> entirely rather than layering `flags > env > config file`, and ships only
> `init` (no separate `config` get/set or default-chat). Matched the
> transcript. (zod resolves to v4 in the CLI vs v3 in core — independent
> schemas, no shared types, so no conflict.)

### 6. Formatting & Linting ✅ (02:37:35)

- [x] Re-read `subtitle.md` around "oxlint" / "formatter" (≈ lines 1329–1425)
      before coding — OXC (oxlint + oxfmt), not Biome/ESLint/Prettier.
- [x] Root devDeps: `oxlint@1.71`, `oxfmt@0.56`, `typescript@6`,
      `@types/node@26`. (`tsdown` deferred to Step 7 to keep the step boundary
      clean — transcript installs it here but doesn't use it until bundling.)
- [x] Formatter config `.oxfmtrc.json` (`$schema` →
      `./node_modules/oxfmt/configuration_schema.json`,
      `ignorePatterns: ["bun.lock", "**/*.md"]`).
- [x] Linter config `.oxlintrc.json` (`$schema` →
      `./node_modules/oxlint/configuration_schema.json`,
      `plugins: ["typescript", "unicorn", "oxc"]`,
      `categories: { correctness: "error", suspicious: "warn" }`, empty
      `rules`, `env: { builtin: true }`).
- [x] Root scripts: `format` (`oxfmt`), `format:check` (`oxfmt --check`),
      `lint` (`oxlint --deny-warnings`), `lint:fix` (`oxlint --fix`),
      `type-check` (`tsc --noEmit -p` over core / cli / mcp-local / remote-mcp).
- [x] Consolidated `@types/node` to the root; removed it from `cli`,
      `mcp-local`, `remote-mcp` (core never had it).
- [x] Ran `bun run format` over the repo (normalizes quotes → double, key
      order, spacing — no behavior change).
      - **Divergence note:** real binaries are `oxfmt` (config `.oxfmtrc.json`,
        default mode `--write`) and `oxlint` (config `.oxlintrc.json`,
        auto-detected) — transcript audio garbled both. Added `**/*.md` to
        `ignorePatterns`: `oxfmt` reflows Markdown and corrupted a nested
        fenced JSON code block in this plan; docs are excluded so
        prose/fences stay intact.

Verified: `bun run lint` → exit 0; `bun run type-check` → exit 0;
`bun run format:check` → "All matched files use the correct format." (21
files).

### 7. Bundling ✅ (02:48:27)

- [x] Re-read `subtitle.md` around "tsdown" / "never bundle" (≈ lines
      1487–1551) before coding. Added `tsdown@0.22.3` (root devDep).
- [x] Per publishable package (`core`, `cli`, `mcp-local`):
      `tsconfig.build.json` (extends root, `include: ["src/**/*"]`,
      `exclude: ["dist", "node_modules"]`) + `tsdown.config.ts`
      (`entry: './src/index.ts'`, `tsconfig: './tsconfig.build.json'`,
      `outExtensions: () => ({ js: '.js', dts: '.d.ts' })`,
      `deps: { neverBundle: [...] }` listing every runtime dep so they stay
      external: core→`['zod']`, cli→`['commander','@anwarhossainsr/sendkit-core','zod']`,
      mcp-local→`['@anwarhossainsr/sendkit-core','@modelcontextprotocol/sdk','zod']`).
- [x] `build` script (`tsdown`) in each package; root `build:core`,
      `build:cli`, `build:mcp-local` (`bun run --filter <name> build`). Build
      core first — its consumers now resolve it through `dist`.
- [x] Each → `dist/` with `index.js` + `index.d.ts` (+ `.map`). Deps
      externalized (core bundle 2.35 kB, zod not inlined).
- [x] Set `main`/`module`/`types` → `dist`, dual `exports`
      (`{ ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } }`)
      on all three. CLI: `bin: { "sendkit": "./dist/index.js" }` + a
      `#!/usr/bin/env node` shebang on the entry (tsdown preserves it and
      chmods the output executable).
      - **Divergence note:** tsdown 0.22 renamed the old `external` / `noExternal`
        options — used the current `deps.neverBundle` (the literal "never
        bundle" the transcript describes) and the `outExtensions` factory.
        Flipping `exports` to `dist` (this step, per the plan) means core must
        be built before `type-check`/dev resolve its consumers — build order is
        core → cli → mcp-local. Org-scope rename + `files`/`publishConfig`/
        `prepublishOnly`/`pack:dry` stay in Step 8.

Verified: `bun run build:core|cli|mcp-local` all exit 0 and emit
`dist/{index.js,index.d.ts,*.map}`; `bun run lint` / `type-check` /
`format:check` pass; built `node packages/cli/dist/index.js telegram 1 hi` →
`Telegram bot token is required. Please run \`sendkit init\`.`; built
`@anwarhossainsr/sendkit-core` imports with all schema/op exports present.

### 8. Publishing (03:03:03)

- [x] **Org-scope rename done** (pulled forward from Step 7): npm org is
      `@anwarhossainsr`. Package names:
      - `@anwarhossainsr/sendkit-core` (was `@sendkit/core`)
      - `@anwarhossainsr/sendkit` (the CLI; was `@sendkit/cli` — bin stays
        `sendkit`, so `npx @anwarhossainsr/sendkit` / global `sendkit`)
      - `@anwarhossainsr/sendkit-mcp-local` (was `@sendkit/mcp-local`)
      - `apps/remote-mcp` left unscoped/private — deployed, not published.
      Updated everywhere: package `name`s, `workspace:*` deps, source imports,
      `tsdown.config.ts` `neverBundle` lists, root `build:*` `--filter` targets,
      `cli` `program.description`. `bun install` refreshed the lockfile; all
      builds + `lint` + `type-check` pass; no `@sendkit/*` left in code.
- [x] Per package (`core`, `cli`, `mcp-local`): removed `private`, added
      `files: ["dist"]`, `publishConfig: { access: "public" }`, and scripts
      `pack:dry` (`bun run build && npm pack --dry-run`) + `prepublishOnly`
      (`bun run build`). Root `release:pack:core|cli|mcp-local`
      (`bun run --filter <name> pack:dry`). `remote-mcp` stays `private`.
      Verified: `pack:dry` tarballs contain only `dist/*` + `package.json`
      (core 2.8 kB, cli 0.73 kB pkg + dist incl. shebang'd `bin`).
- [ ] Versioning strategy (changesets or manual) — currently core/cli `0.1.0`,
      mcp-local `0.0.0`; bump before first publish if desired.
- [ ] **Publish (manual — irreversible, needs auth):** `bun login` (npm user
      under org `anwarhossainsr`), then publish core first (others depend on
      it): `cd packages/core && bun publish`, then
      `cd packages/cli && bun publish`. Verify `npx @anwarhossainsr/sendkit`.
      - **Divergence note:** use **`bun publish`, NOT `npm publish`** — cli &
        mcp-local depend on core via `workspace:*`, which `npm publish` leaves
        literal in the tarball (broken for installers). Confirmed: `npm pack`
        keeps `"workspace:*"`; `bun publish` rewrites it to the resolved
        version. `publishConfig.access: public` is required (scoped packages
        default private). `prepublishOnly` rebuilds `dist` on every publish.

### 9. Deploying OAuth (Remote MCP) (03:35:02)

- [ ] Re-read `subtitle.md` around "deploy" before coding for the target host
      and required env/secrets setup it walks through.
- [ ] Deploy `apps/remote-mcp`.
- [ ] Production env + secrets (bot token, OAuth creds).
- [ ] Verify a remote MCP client can connect and send.

### 10. Skill — `sendkit-skill` (03:37:46)

- [ ] Re-read `subtitle.md` around "skill" before coding for the exact skill
      file structure/instructions format it demonstrates.
- [ ] Author agent instructions: when to send, required inputs, examples.
- [ ] Reference the MCP tool(s) so an agent knows how to invoke them.

---

## Conventions

- **Bun** for runtime, scripts, workspaces.
- **TypeScript strict** (`noUncheckedIndexedAccess` on) — each package's
  `tsconfig.json` extends the root.
- **Zod** schemas live in core and are reused by every adapter (CLI args, MCP
  tool input) — validate once, infer types everywhere.
- **Core stays pure**: environment-agnostic, throws `Error` on invalid input
  or failed requests, never reads `process.env` or calls `process.exit`.
  Adapters own process/transport concerns and decide how to surface errors.
- **Secrets** via env / config, never committed.

---

## Open Questions

- [ ] Channels beyond Telegram in scope now, or Telegram-only for v1?
- [ ] OAuth provider — self-issued, or an external IdP?
- [ ] Remote MCP deploy target?
- [x] npm scope — `@anwarhossainsr` (org `anwarhossainsr`); packages renamed.
