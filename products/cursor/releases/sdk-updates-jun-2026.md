---
product: cursor
version: "sdk-updates-jun-2026"
released_at: "2026-06-04"
source_url: "https://cursor.com/changelog/sdk-updates-jun-2026"
fetched_at: "2026-10-06"
title: "Custom stores, custom tools, and auto-review for the Cursor SDK"
---

# cursor — Custom stores, custom tools, and auto-review for the Cursor SDK

<p>We&#39;ve shipped a batch of new functionality across the <a href="https://cursor.com/docs/sdk/typescript">TypeScript</a> and <a href="https://cursor.com/docs/sdk/python">Python</a> SDKs. You can now choose how agent and run metadata is persisted, expose your own functions to the agent as tools, route local tool calls through auto-review, and nest subagents to any depth. This release also brings a set of reliability, performance, and platform fixes that make local and cloud SDK agents easier to run in production scripts, CI, and custom integrations.</p>
<h2>Custom tools</h2>
<p>You can now hand the local agent your own tools by passing function definitions through `local.customTools`, on `Agent.create()` or per `send()`. The SDK exposes them to the agent through a built-in MCP server called `custom-user-tools`, so the model calls your code through the same path and the same permission gate as any other MCP tool.</p>
<p>Before this, exposing a custom capability meant standing up your own stdio or remote HTTP MCP server and wiring it into the agent. Now a function definition is enough. Custom tools are also visible to every subagent of a parent agent, so a tool you define once is available throughout the whole run.</p>
<h2>Auto-review</h2>
<p>By default, a local SDK agent runs tool calls without asking for approval, since there&#39;s no human in the loop in a headless run. Set `local.autoReview` to route those calls through <a href="https://cursor.com/docs/agent/security/run-modes">auto-review</a> instead. A classifier decides which calls run automatically and which to hold back, rather than bypassing review entirely.</p>
<p>You steer that classifier with natural-language instructions in <a href="https://cursor.com/docs/reference/permissions">`permissions.json`</a>. The `autoRun.allow_instructions` field describes call shapes to lean toward allowing, and `autoRun.block_instructions` describes the ones to hold for review. For example, you can allow read-only inspections of build artifacts while always pausing on destructive operations like deletes.</p>
<p>```jsonc { &quot;autoRun&quot;: { &quot;allow_instructions&quot;: [ &quot;Read-only inspections of build artifacts under ./dist are fine.&quot; ], &quot;block_instructions&quot;: [ &quot;Always pause delete operations so I get a chance to review them.&quot; ] } } ```</p>
<h2>JSONL and custom stores</h2>
<p>Both SDKs persist agent and run metadata so you can resume an agent after a process restart. Until now, that store was SQLite. You can now opt into a JSONL store instead, which writes a plain, append-only file you can read, diff, and check into version control. Both `SqliteLocalAgentStore` and `JsonlLocalAgentStore` are exported directly.</p>
<p>If neither default fits your setup, implement the public `LocalAgentStore` interface and pass it through `local.store`. Build an in-memory store for ephemeral CI runs, or back persistence with Postgres when you want agent state to live next to the rest of your application data. The Python SDK exposes host, JSONL, and composed JSONL stores through the bridge.</p>
<h2>Nested subagents</h2>
<p>Subagents can now spawn their own subagents, and so on. A reviewer subagent can delegate to a test-writer, which can delegate further, with each level keeping its own prompt and model. There&#39;s nothing to turn on; a subagent session registers the executor it needs to call `Task`, so nesting works automatically for any agent that defines subagents.</p>
<h2>Reliability, performance, and platform improvements</h2>
<p>This release also includes a batch of quality-of-life fixes across both SDKs.</p>
<p>Reliability</p>
<ul>
<li>**Run correlation**: Every `send()` now carries a platform-generated `requestId`, exposed on `Run` and `RunResult` and persisted across the in-memory, SQLite, and JSONL stores. Tie a script or CI run to backend logs, analytics, and support threads without inferring it from `agentId`.</li>
<li>**Reliable `wait()` on local runs**: Local runs no longer resolve `wait()` before the terminal result is written. Hydration keeps refreshing until the run reaches a final state, so automation reads a complete result.</li>
<li>**Safe checkpoints on dispose**: Disposing a local agent no longer removes checkpoint data when a root reference is missing but checkpoint blobs still exist. The agent directory is only cleared when there&#39;s genuinely nothing left to keep.</li>
<li>**Cloud streaming over HTTP/1.1**: Cloud agent sessions now stream correctly on HTTP/1.1 transports used by some proxies, older Node fetch stacks, and certain CI images. HTTP/2 behavior is unchanged.</li>
</ul>
<p>Performance and packaging</p>
<ul>
<li>**Lighter import**: Importing `@cursor/sdk` no longer eagerly loads the full local agent stack. Cloud-only and type-only consumers skip the local runtime cost until the first local call, with no API change. The first local call pays a one-time import, then stays cached.</li>
<li>**Self-contained TypeScript types**: Published `.d.ts` files no longer reference unpublished workspace packages. This fixes `TS2305` and `TS2307` errors under `skipLibCheck: false` and silent `any` on stream types like `TurnEndedUpdate`.</li>
<li>**Bundled ripgrep**: Local shell runs use the bundled platform `rg` binary without modifying your global `PATH`. On Windows, prepending ripgrep no longer clobbers the `Path` variable.</li>
</ul>
<p>Models</p>
<ul>
<li>**Composer 2 routes to Composer 2.5**: SDK clients still pinning retired `composer-2` slugs are routed to Composer 2.5 automatically, keeping fast variants intact, so older scripts keep running.</li>
</ul>
<p>Python SDK</p>
<ul>
<li>**Workspace-scoped `list_runs`**: `Client`, `AsyncClient`, and `Agent.list_runs` take an optional `cwd`, and the bridge falls back to its launch workspace. This fixes spurious &quot;agent not found&quot; results when the bridge runs as a subprocess.</li>
<li>**Clearer not-found errors**: Looking up an agent that isn&#39;t in the resolved workspace returns a clear not-found error instead of an opaque internal error.</li>
<li>**0.1.6 release and analytics**: `cursor-sdk` 0.1.6 documents the Buildkite release path and labels SDK usage as `sdk-python-` for clearer analytics.</li>
</ul>
<p>Run `npm install @cursor/sdk` or `pip install cursor-sdk` to upgrade. Scripts pinning `composer-2` move to Composer 2.5 automatically, and `requestId` is a safe addition to your run metadata schema. See the <a href="https://cursor.com/docs/sdk/typescript">TypeScript</a> and <a href="https://cursor.com/docs/sdk/python">Python</a> docs for full details.</p>
