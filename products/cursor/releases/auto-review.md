---
product: cursor
version: "auto-review"
released_at: "2026-05-29"
source_url: "https://cursor.com/changelog/auto-review"
fetched_at: "2026-10-06"
title: "Auto-review Run Mode"
---

# cursor — Auto-review Run Mode

<p>Auto-review is a new run mode that allows Cursor to work for longer with fewer approval prompts and safer execution.</p>
<p>Auto-review applies to Shell, MCP, and Fetch tool calls. Allowlisted calls run immediately, and calls that can be sandboxed run in the sandbox. All other agent actions go to a classifier subagent that decides whether to allow the call, try a different approach, or ask for your approval.</p>
<p>Configure your run mode in **Settings &gt; Cursor Settings &gt; Agents &gt; Approvals &amp; Execution**. You can also steer the classifier agent by giving it custom instructions.</p>
<p>Learn more in our <a href="https://cursor.com/docs/agent/security/run-modes">docs</a>.</p>
