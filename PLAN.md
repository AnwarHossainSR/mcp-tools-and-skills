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

- **Shared Core (`@sendkit/core`)** — single source of truth. Zod input
  schemas, the `sendTelegramMessage()` function that calls the Telegram Bot
  API, and exported types. No adapter talks to Telegram directly; they all go
  through core.
- **Adapters** — thin wrappers that translate their transport into a core call:
  - **CLI** (`@sendkit/cli`) — `sendkit telegram <chatId> <message>`. Human use.
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
- [x] CLI package scaffolded (`@sendkit/cli`, commander).
- [x] CLI `telegram` command sends a real message via the Telegram Bot API
      (`TELEGRAM_BOT_TOKEN` from env).
- [x] `.env` git-ignored; `.env.example` present.

> The CLI currently inlines `sendTelegramMessage()`. Step 1 below extracts it
> into the shared core and makes the CLI consume it.

---

## Build Order

Mirrors the video walkthrough. Each step ships something runnable.

### 1. Shared Core — `@sendkit/core`
**Goal:** one place that owns the Telegram logic + validation.

- [ ] New package `packages/core` (`@sendkit/core`), its own `tsconfig.json`
      extending root.
- [ ] Add `zod` dependency.
- [ ] Define input schema, e.g. `sendTelegramSchema = z.object({ chatId, message })`.
- [ ] Implement `sendTelegramMessage(input)` — validate with Zod, call
      `https://api.telegram.org/bot<token>/sendMessage`, return a typed result
      (`{ ok, messageId }` or a typed error) instead of `process.exit`.
- [ ] Read token from a passed-in config/env, not hardcoded — adapters supply it.
- [ ] Export schemas + inferred types + the function from the package entry.
- [ ] Refactor CLI to import and call core; CLI keeps the `process.exit` /
      `console.error` handling, core stays pure.

### 2. Local MCP Server (stdio)
**Goal:** expose the same capability to local AI agents.

- [ ] New package (e.g. `packages/mcp-local`), depend on `@sendkit/core` and
      `@modelcontextprotocol/sdk`.
- [ ] Stdio transport server.
- [ ] Register a `send_telegram_message` tool; reuse the core Zod schema for the
      tool's input schema.
- [ ] Tool handler calls `sendTelegramMessage()`, maps result to MCP content.
- [ ] Document Claude Desktop / MCP client config to run it.

### 3. Remote MCP Server — `apps/remote-mcp`
**Goal:** same tool over HTTP for remote clients.

- [ ] New app `apps/remote-mcp` (Hono + Bun).
- [ ] `POST /mcp` endpoint wiring the MCP server over HTTP transport.
- [ ] Bearer-token auth middleware as the first cut.
- [ ] Reuse `@sendkit/core` for the tool (no logic duplication).

### 4. OAuth
**Goal:** replace the static bearer token with real auth.

- [ ] OAuth flow for the remote MCP server (authorization + token endpoints /
      metadata as MCP auth spec requires).
- [ ] Protect `POST /mcp` behind validated OAuth tokens.

### 5. CLI Config
**Goal:** stop depending on a single ambient `.env`.

- [ ] Config resolution: flags > env > config file (e.g. `~/.sendkit/config`).
- [ ] `sendkit config` commands (set/get token, default chat) as needed.

### 6. Formatting & Linting
- [ ] Add Biome (or ESLint + Prettier) at the root.
- [ ] Scripts: `lint`, `format`. Apply across all packages.

### 7. Bundling
- [ ] Build each publishable package (`bun build` / `tsup`) → `dist/` with
      `.js` + `.d.ts`.
- [ ] Set `main`/`module`/`types`/`exports` and `bin` (CLI) in each
      `package.json`.

### 8. Publishing
- [ ] Prepare packages for npm (names, versions, `files`, `publishConfig`).
- [ ] Versioning strategy (changesets or manual).
- [ ] Publish `@sendkit/core` and `@sendkit/cli` first; verify `npx sendkit`.

### 9. Deploying OAuth (Remote MCP)
- [ ] Deploy `apps/remote-mcp` (target TBD — e.g. Cloudflare / Fly / Render).
- [ ] Production env + secrets (bot token, OAuth creds).
- [ ] Verify a remote MCP client can connect and send.

### 10. Skill — `sendkit-skill`
- [ ] Author agent instructions: when to send, required inputs, examples.
- [ ] Reference the MCP tool(s) so an agent knows how to invoke them.

---

## Conventions

- **Bun** for runtime, scripts, workspaces.
- **TypeScript strict** (`noUncheckedIndexedAccess` on) — each package's
  `tsconfig.json` extends the root.
- **Zod** schemas live in core and are reused by every adapter (CLI args, MCP
  tool input) — validate once, infer types everywhere.
- **Core stays pure**: returns typed results/errors, never calls
  `process.exit`. Adapters own process/transport concerns.
- **Secrets** via env / config, never committed.

---

## Open Questions

- [ ] Channels beyond Telegram in scope now, or Telegram-only for v1?
- [ ] OAuth provider — self-issued, or an external IdP?
- [ ] Remote MCP deploy target?
- [ ] npm scope `@sendkit/*` available / chosen?
