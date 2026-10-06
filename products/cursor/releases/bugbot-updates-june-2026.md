---
product: cursor
version: "bugbot-updates-june-2026"
released_at: "2026-06-10"
source_url: "https://cursor.com/changelog/bugbot-updates-june-2026"
fetched_at: "2026-10-06"
title: "Bugbot is now over 3x faster, 22% cheaper, and finds 10% more bugs"
---

# cursor — Bugbot is now over 3x faster, 22% cheaper, and finds 10% more bugs

<p>The average review time for Bugbot is now ~90 seconds, down from ~5 minutes. Bugbot also finds 10% more bugs per review on average — 0.62, up from 0.56 — and costs ~22% less per run.</p>
<p>&lt;figure&gt;&lt;img src=&quot;https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/bugbot-performance.png&quot; loading=&quot;lazy&quot; alt=&quot;Bugbot is now over 3x faster, 22% cheaper, and finds 10% more bugs per review.&quot; /&gt;&lt;figcaption&gt;Bugbot is now over 3x faster, 22% cheaper, and finds 10% more bugs per review.&lt;/figcaption&gt;&lt;/figure&gt;</p>
<p>These performance gains are made possible by progress we&#39;ve made training Composer 2.5, which now powers Bugbot. Bugbot respects model block lists, and speed and performance can vary depending on your configuration.</p>
<h2>Run Bugbot before you push</h2>
<p>You can now run <a href="https://cursor.com/docs/bugbot#run-in-your-agent">Bugbot</a> and <a href="https://cursor.com/docs/security-agents#run-in-your-agent">Security Review</a> with `/review` before pushing code. `/review` prompts you to choose which agents to run, or use `/review-bugbot` and `/review-security` directly.</p>
<p>`/review` also syncs with Bugbot on GitHub and GitLab. If you run `/review` and then open a PR with the same diff, Bugbot recognizes it, skips the review, and leaves a comment noting it has already reviewed that diff.</p>
<p>Available in Cursor 3.7+ and on <a href="https://cursor.com/agents">cursor.com/agents</a>, with support in CLI coming soon.</p>
<h2>Only review what&#39;s new in your PR</h2>
<p>You can now configure Bugbot to only review what&#39;s new since the last review, keeping feedback focused on your latest updates.</p>
<p>Learn more in our <a href="https://cursor.com/docs/bugbot">docs</a>.</p>
