---
product: cursor
version: "enterprise-organizations"
released_at: "2026-06-03"
source_url: "https://cursor.com/changelog/enterprise-organizations"
fetched_at: "2026-10-06"
title: "Organizations for Cursor Enterprise"
---

# cursor — Organizations for Cursor Enterprise

<p>Enterprise customers can now manage multiple Cursor teams from one place, with different security, governance, budget, and feature controls for each. These capabilities are now generally available to all Enterprise customers.</p>
<p>&lt;figure&gt;&lt;img src=&quot;https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/blog/ent-org-arch-4-light.png&quot; loading=&quot;lazy&quot; alt=&quot;Cursor Enterprise organization architecture with organizations, teams, and groups&quot; /&gt;&lt;figcaption&gt;Cursor Enterprise organization architecture with organizations, teams, and groups&lt;/figcaption&gt;&lt;/figure&gt;</p>
<h2>Organizations</h2>
<p>An organization is the top-level container for your company&#39;s identity, administration, and membership. It gives admins one place to view and manage their entire Cursor setup, including a rollup of spend and token usage across every team.</p>
<h2>Teams</h2>
<p>Teams are the operating unit for a department, region, or subsidiary. This is what admins manage as their Cursor org today. We&#39;ve moved that unit under an organization, so you can run multiple teams, each with its own security, governance, spend, and feature settings.</p>
<p>A user can belong to more than one team, with a different role in each. For current customers, your existing team is preserved and becomes the default home for login, routing, and creating new teams.</p>
<h2>Groups</h2>
<p>Groups are a lightweight collection of users that can sit across or within teams. They give cohorts of users separate model access, spend limits, and agent permissions without standing up a whole new team. When a user belongs to more than one team or group, the most permissive setting wins.</p>
<p>Learn more in our <a href="https://cursor.com/blog/organizations">announcement post</a> or <a href="https://cursor.com/docs/enterprise/organizations">docs</a>.</p>
<p>Improvements (5)</p>
<ul>
<li>Multi-team support so users can be on multiple teams at once</li>
<li>Organization-level IDP management</li>
<li>Organization-level usage analytics, with drill downs to each team</li>
<li>Admins can move users between teams through the dashboard, <a href="https://cursor.com/docs/account/organizations/organization-admin-api">API</a>, or CSV</li>
<li>New users joining a team inherit settings and permissions automatically</li>
</ul>
