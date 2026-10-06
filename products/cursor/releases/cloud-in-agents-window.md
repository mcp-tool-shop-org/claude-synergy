---
product: cursor
version: "cloud-in-agents-window"
released_at: "2026-06-17"
source_url: "https://cursor.com/changelog/cloud-in-agents-window"
fetched_at: "2026-10-06"
title: "Cloud Environment Setup and Cloud Subagents in Agents Window"
---

# cursor — Cloud Environment Setup and Cloud Subagents in Agents Window

<p>This release introduces updates to <a href="https://cursor.com/docs/cloud-agent">cloud agents</a> in the <a href="https://cursor.com/docs/agent/agents-window">Agents Window</a> of the Cursor desktop app.</p>
<h2>Cloud environment setup</h2>
<p>Cursor can now help you set up your dev environment in the cloud in less than 10 minutes. You can watch the agent&#39;s progress in a shared terminal session as it handles setup tasks like installing dependencies.</p>
<p>Your environment is captured in a reusable snapshot, so future cloud agents start up faster with the ability to test changes by running your software. It can iterate over long time horizons until outputs are verified. This benefits your entire team when committed to `.cursor/environment.json`.</p>
<p>&lt;figure&gt;&lt;img src=&quot;https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/cloud-environment-setup.png&quot; loading=&quot;lazy&quot; alt=&quot;Cloud environment setup&quot; /&gt;&lt;figcaption&gt;Cloud environment setup&lt;/figcaption&gt;&lt;/figure&gt;</p>
<h2>Cloud subagents with /in-cloud</h2>
<p>Use `/in-cloud` to spin up a cloud subagent in its own VM to work on the next task you submit. It runs on its own VM and branch, so your local workspace stays clean and responsive.</p>
<p>This is especially useful for isolating long-running or parallel work like fixing CI, investigating an issue, or exploring a codebase while you keep working locally.</p>
<p>You can also ask a cloud subagent to babysit a PR by clicking on the quick-action pill or using `/babysit`. The cloud agent will iterate remotely to prepare your PR for merge without tying up the local session.</p>
<p>The cloud subagent can run in the background without interrupting the parent agent, which can continue to run locally or in the cloud.</p>
<h2>Handoff between local and cloud</h2>
<p>Move agent sessions more reliably between your local computer and the cloud. You can offload long-running work from your machine and run as many cloud agents in parallel as you want. Pull a cloud agent back down to local to test changes yourself.</p>
<p>&lt;figure&gt;&lt;img src=&quot;https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/handoff-to-cloud.png&quot; loading=&quot;lazy&quot; alt=&quot;Handoff between local and cloud&quot; /&gt;&lt;figcaption&gt;Handoff between local and cloud&lt;/figcaption&gt;&lt;/figure&gt;</p>
