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

| Step | Video timestamp |
|---|---|
| 1. Shared Core | 00:39:34 |
| 2. Local MCP | 01:09:18 |
| 3. Remote MCP | 01:36:38 |
| 4. OAuth | 01:57:54 |
| 5. CLI Config | 02:21:55 |
| 6. Formatting & Linting | 02:37:35 |
| 7. Bundling | 02:48:27 |
| 8. Publishing | 03:03:03 |
| 9. Deploying OAuth | 03:35:02 |
| 10. Skill | 03:37:46 |

### 1. Shared Core — `@sendkit/core` ✅ (00:39:34)
**Goal:** one place that owns the Telegram logic + validation.

- [x] New package `packages/core` (`@sendkit/core`), its own `tsconfig.json`
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
      `import { sendTelegramMessage } from '@sendkit/core'`.
- [x] Refactor CLI to import core and call it in a `try/catch`; CLI resolves
      `TELEGRAM_BOT_TOKEN` from env and owns all `process.exit` /
      `console.error` handling — core stays pure and environment-agnostic so
      the same operation can be reused by local MCP, remote MCP, etc.

Verified: `tsc --noEmit` passes for core + cli; `bun run dev:cli telegram …`
loads the token, validates with Zod, calls the API, and surfaces Telegram's
own error message via the thrown `Error`.

### 2. Local MCP Server (stdio) (01:09:18)
**Goal:** expose the same capability to local AI agents.

- [ ] Re-read `subtitle.md` around "local MCP" / "create server" / "register
      tool" before coding — confirm package layout, function names
      (`createServer(botToken)` per the transcript), and whether the tool
      input schema is `telegramMessageInputSchema.shape` (chatId + message
      only, botToken supplied by the server, not the caller).
- [ ] New package (e.g. `packages/mcp-local`), depend on `@sendkit/core` and
      `@modelcontextprotocol/sdk`.
- [ ] Stdio transport server.
- [ ] Register a `telegram` tool; reuse `telegramMessageInputSchema.shape` for
      the tool's input schema.
- [ ] Tool handler calls `sendTelegramMessage({ ...input, botToken })`, maps
      result/thrown error to MCP content.
- [ ] Document Claude Desktop / MCP client config to run it.

### 3. Remote MCP Server — `apps/remote-mcp` (01:36:38)
**Goal:** same tool over HTTP for remote clients.

- [ ] Re-read `subtitle.md` around "remote MCP" before coding.
- [ ] New app `apps/remote-mcp` (Hono + Bun).
- [ ] `POST /mcp` endpoint wiring the MCP server over HTTP transport.
- [ ] Bearer-token auth middleware as the first cut.
- [ ] Reuse `@sendkit/core` for the tool (no logic duplication).

### 4. OAuth (01:57:54)
**Goal:** replace the static bearer token with real auth.

- [ ] Re-read `subtitle.md` around "OAuth" before coding.
- [ ] OAuth flow for the remote MCP server (authorization + token endpoints /
      metadata as MCP auth spec requires).
- [ ] Protect `POST /mcp` behind validated OAuth tokens.

### 5. CLI Config (02:21:55)
**Goal:** stop depending on a single ambient `.env`.

- [ ] Re-read `subtitle.md` around "CLI config" / "config.json" before coding
      — transcript describes a `~/.sendkit` (or similarly named) folder with
      `config.json`, validated via a Zod config schema, and a `sendkit init`
      command.
- [ ] Config resolution: flags > env > config file.
- [ ] `sendkit config` / `sendkit init` commands (set/get token, default chat)
      as needed.

### 6. Formatting & Linting (02:37:35)
- [ ] Re-read `subtitle.md` around "oxlint" / "formatter" before coding —
      transcript uses `oxlintrc.json` + an oxc formatter config, not
      Biome/ESLint/Prettier.
- [ ] Add the formatter + linter configs at the root.
- [ ] Scripts: `lint`, `format`. Apply across all packages.

### 7. Bundling (02:48:27)
- [ ] Re-read `subtitle.md` around "tsdown" / "never bundle" before coding —
      transcript bundles with `tsdown`, marking workspace deps (e.g. zod,
      `@sendkit/core`, `@modelcontextprotocol/sdk`) as `noExternal: false` /
      "never bundle" so they stay external instead of inlined.
- [ ] Build each publishable package → `dist/` with `.js` + `.d.ts`.
- [ ] Set `main`/`module`/`types`/`exports` and `bin` (CLI) in each
      `package.json`.

### 8. Publishing (03:03:03)
- [ ] Re-read `subtitle.md` around "npm pack" / "publish" before coding —
      transcript dry-runs with `pnpm/bun pack --dry-run` per package, starting
      with core (everything else depends on it), then renames packages under
      an npm org scope before publishing.
- [ ] Prepare packages for npm (names, versions, `files`, `publishConfig`).
- [ ] Versioning strategy (changesets or manual).
- [ ] Publish `@sendkit/core` and `@sendkit/cli` first; verify `npx sendkit`.

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
- [ ] npm scope `@sendkit/*` available / chosen?
