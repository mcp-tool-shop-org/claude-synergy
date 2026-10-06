---
product: cursor
version: "rollouts-and-security-reviewer"
released_at: "2026-09-23"
source_url: "https://cursor.com/changelog/rollouts-and-security-reviewer"
fetched_at: "2026-10-06"
title: "Rollouts and Security Review"
---

# cursor — Rollouts and Security Review

<p>Today we&#39;re launching two Cursor bots for the last mile of shipping code. Rollouts watches every change as it deploys and reports its health per environment. Security Review reports exploitable bugs on every pull request.</p>
<p>Both are available today on Teams and Enterprise plans.</p>
<h2>Rollouts</h2>
<p>Rollouts attaches a monitor to every pull request and watches the change as it deploys, reporting change health per environment: verified healthy, regression detected, or inconclusive. It&#39;s the Cursor version of <a href="https://cursor.com/blog/firetiger">Firetiger</a> Change Monitors, rebuilt with the Bot Development Kit.</p>
<p>Enable it from the dashboard and connect source control, your deploy system, and your telemetry provider. Rollouts starts watching on the next pull request.</p>
<h4>Monitoring plans</h4>
<p>When a pull request opens, Rollouts reads the diff and the systems it touches, then writes a monitoring plan as a PR comment. The plan lists the risks it identified, the effect the change is meant to have, the signals it will check, and any gaps in instrumentation that would make the change hard to verify. Edit the plan in the PR and Rollouts uses your version.</p>
<h4>Deploy tracking</h4>
<p>Rollouts wakes on deploy events for the change&#39;s commit and runs the plan against your logs, metrics, and traces. It tracks each environment separately, so a change can be verified in staging and still flagged in production. Rollouts checks the change&#39;s intended effect alongside error and latency signals, and reports back on the PR when it reaches a verdict.</p>
<h4>Regressions</h4>
<p>When Rollouts detects a regression, it names the change it suspects and notifies the author. Depending on configuration, it can also open a revert PR for review or hand the finding to a cloud agent for a fix. Rollouts does not merge or roll back on its own today.</p>
<h4>Integrations</h4>
<p>Rollouts connects to Origin or GitHub for source control, to your continuous delivery system for deploy events, and to Datadog and other telemetry providers for signals. Feature flag integration is coming soon.</p>
<h2>Security Review</h2>
<p>Security Review is available today. It reads every pull request in the context of the codebase and posts one review comment reporting exploitable bugs. Style and quality stay with Bugbot.</p>
<p>&lt;figure&gt;&lt;img src=&quot;https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/security-review-N8azgyLevr8FvNIRqJN6hk71os2Oxu.png&quot; loading=&quot;lazy&quot; alt=&quot;Security Review comment on a pull request reporting an exploitable bug with a severity and proposed fix&quot; /&gt;&lt;figcaption&gt;Security Review comment on a pull request reporting an exploitable bug with a severity and proposed fix&lt;/figcaption&gt;&lt;/figure&gt;</p>
<p>Enable it from the dashboard for the repositories you want reviewed. Draft PRs are skipped.</p>
<h4>What it reports</h4>
<p>Security Review looks for injection across SQL, command, and template surfaces, along with authentication and authorization bypasses, including checks that a refactor stopped running. It also flags secrets and credentials committed to source, SSRF and unvalidated redirects, unsafe deserialization, and dependency changes that introduce known vulnerabilities. It traces where user input enters and what it passes through.</p>
<h4>Findings</h4>
<p>Each finding carries a severity, the attack path, and a proposed fix. Dismiss one with a reason and Security Review won&#39;t raise it again on that PR.</p>
<h4>Team rules</h4>
<p>Add rules for your codebase, such as which client external calls must go through or which tables are never queried from a request handler, and Security Review enforces them on every PR.</p>
<h2>Get started</h2>
<p>Rollouts and Security Reviewer are available today on Teams and Enterprise plans. Enable either bot from the <a href="https://cursor.com/automations">automations</a> tab.</p>
<p>For the next 10 days, we&#39;re including usage credits so teams can try Rollouts on real changes. Teams and Enterprise customers receive credits for roughly 50 and 500 changes, respectively.</p>
