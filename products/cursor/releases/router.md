---
product: cursor
version: "router"
released_at: "2026-07-22"
source_url: "https://cursor.com/changelog/router"
fetched_at: "2026-10-06"
title: "Cursor Router"
---

# cursor — Cursor Router

<p>Auto mode is now powered by Cursor Router.</p>
<p><a href="https://cursor.com/blog/router">Cursor Router</a> is our intelligent model router. It analyzes each request and sends it to the right model for the job. Frontier models handle work that demands them. Price-efficient models handle the rest.</p>
<h2>Optimization modes</h2>
<p>Select Auto, then choose how the router optimizes:</p>
<ul>
<li>**Intelligence:** Frontier quality, matching the most expensive and powerful models that might be out of reach for daily use.</li>
<li>**Balance:** Strong quality, matching the frontier models that most people like to daily drive.</li>
<li>**Cost:** Good quality, reaching the highest available intelligence while optimizing token spend.</li>
</ul>
<p>Balance and Intelligence bill at the routed model’s rate. Each mode moves you along the cost-intelligence pareto frontier.</p>
<h2>Admin controls</h2>
<p>Admins can enable the router per team or group, restrict which optimization modes members can use, set the default mode, and allow or block underlying models.</p>
<p>Cursor Router is available across desktop, web, iOS, CLI, and our SDK. It is on by default for Teams plans. Enterprise admins can enable it from the dashboard.</p>
<p>Learn more in our <a href="https://cursor.com/blog/router">announcement</a> and <a href="https://cursor.com/docs/cursor-router">docs</a>.</p>
<p>Improvements</p>
<ul>
<li>Per-request classification by task type and complexity</li>
<li>Optimization modes: Cost, Balance, and Intelligence</li>
<li>Admin controls: per-team and per-group enablement, mode restrictions, default mode, and model allow and block lists</li>
<li>Routed model can be displayed or hidden (hidden by default)</li>
<li>Soft and hard enforcement options for standardizing on Auto</li>
<li>Grok 4.5 required as a price-efficient routing option</li>
</ul>
