---
product: cursor
version: "sdk-release"
released_at: "2026-04-29"
source_url: "https://cursor.com/changelog/sdk-release"
fetched_at: "2026-05-22"
title: "Build programmatic agents with the Cursor SDK"
---

# cursor — Build programmatic agents with the Cursor SDK

<p>We&#39;re introducing the Cursor SDK so you can build agents with the same runtime, harness, and models that power Cursor.</p>
<p>The agents that run in the Cursor desktop app, CLI, and web app are now accessible with a few lines of TypeScript. Run it on your machine or on Cursor&#39;s cloud against a dedicated VM, with any frontier model.</p>
<p>Run `npm install @cursor/sdk` to get started. You can also use Cursor&#39;s native `/sdk` skill to help you start building.</p>
<p>```jsx import { Agent } from &quot;@cursor/sdk&quot;;</p>
<p>const agent = await Agent.create({ apiKey: process.env.CURSOR_API_KEY!, model: { id: &quot;composer-2&quot; }, local: { cwd: process.cwd() }, });</p>
<p>const run = await agent.send(&quot;Summarize what this repository does&quot;);</p>
<p>for await (const event of run.stream()) { console.log(event); } ```</p>
<p>We built a few sample projects that you can access from a <a href="https://github.com/cursor/cookbook">public repo</a>. Fork and extend them for your own use case.</p>
<p>The Cursor SDK is now available for all users in public beta and is billed based on standard, token-based consumption pricing. Learn more in our <a href="https://cursor.com/blog/typescript-sdk">announcement</a> and <a href="https://cursor.com/docs/sdk/typescript">docs</a>.</p>
<p>Updates to the Cloud Agents API</p>
<ul>
<li>Reworked the API around durable agents and per-prompt runs, so follow-ups, status, streaming, and cancellation are now run-scoped.</li>
<li>Added first-class run streaming with SSE events, reconnect support via `Last-Event-ID`, and clearer terminal states.</li>
<li>Added explicit agent lifecycle controls with archive, unarchive, and permanent delete.</li>
<li>Standardized v1 response and error shapes, including structured error codes, `items` list responses, and separate `agent` / `run` objects.</li>
</ul>
