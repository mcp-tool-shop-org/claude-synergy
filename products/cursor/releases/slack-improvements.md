---
product: cursor
version: "slack-improvements"
released_at: "2026-07-17"
source_url: "https://cursor.com/changelog/slack-improvements"
fetched_at: "2026-10-06"
title: "Improvements to Cursor in Slack"
---

# cursor — Improvements to Cursor in Slack

<p>Cursor in Slack now shares a plan before it starts, runs in multi-repo environments, and can work across channels and threads.</p>
<h2>Interaction improvements</h2>
<p>Cursor now responds with a plan before it begins, so you can jump in and redirect early. As it works, it updates its status so you can follow each step.</p>
<p>We also refined how Cursor&#39;s responses look in Slack. In-message buttons are gone, replaced by compact footer links. Tables, PRs, and artifacts now render more cleanly.</p>
<h2>Multi-repo environment support</h2>
<p>From Slack, Cursor can now start in a named multi-repo environment instead of a single default repository. If your frontend, backend, and shared code live in separate repos, Cursor reads your request and targets the environment that gives it access to all of them.</p>
<p>Mid-task, when Cursor needs a repo outside the current environment, it prompts you with a **Switch repository** button. Click it, choose the repo or environment, and Cursor picks up right where it left off.</p>
<h2>Cross-channel workflows</h2>
<p>Cursor can now read from and send messages to other Slack channels and threads. During a task, it can pull context from elsewhere in the workspace and post updates back in the original thread or the relevant channel.</p>
<p>Learn more in our <a href="https://cursor.com/docs/integrations/slack">Slack docs</a>.</p>
