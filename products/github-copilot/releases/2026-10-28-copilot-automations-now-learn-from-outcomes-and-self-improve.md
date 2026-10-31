---
product: github-copilot
version: "2026-10-28-copilot-automations-now-learn-from-outcomes-and-self-improve"
released_at: "2026-10-28"
source_url: "https://github.blog/changelog/2026-10-28-copilot-automations-now-learn-from-outcomes-and-self-improve"
fetched_at: "2026-10-31"
title: "Copilot Automations now learn from outcomes and self-improve"
---

# github-copilot — Copilot Automations now learn from outcomes and self-improve

<div class="BorderBottom">
	<div class="container-xl p-responsive-blog">
		<div class="BackLink-wrap">
			<a href="https://github.blog/changelog/" class="BackLink LinkMono LinkMono--primary" data-analytics-click="Changelog, click on back link, text: Back to changelog; ref_location:changelog post header;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"></path></svg>
				<span class="LinkUnderline">Back to changelog</span>
			</a>
		</div>
	</div>
</div>

	<div class="BorderBottom">
		<div class="container-xl p-responsive-blog">
			<header>
	<div class="ChangelogHeader-single">
					<div class="ChangelogHeader-single-tag">
				<span class="Tag Tag--type">Improvement</span>
			</div>
				<div class="Text-monospace ChangelogHeader-single-meta">
	<time datetime="2026-10-28">
	October 28, 2026</time>			•
		1 minute read	</div>
		<h1 class="Heading--2">Copilot Automations now learn from outcomes and self-improve</h1>
	</div>
	
	<div class="ChangelogFeaturedImage">
					<svg aria-hidden="true" width="2400" height="1260" role="presentation"></svg>
			<img width="2064" height="1096" src="https://github.blog/wp-content/uploads/2026/11/680960714-f07967c3-c256-495b-83d6-8b4776deda52.jpg?resize=2064%2C1096" class="CoverImage wp-post-image" alt="Header image with a screenshot of the UI for approving automation improvement proposals" decoding="async" fetchpriority="high" srcset="https://github.blog/wp-content/uploads/2026/11/680960714-f07967c3-c256-495b-83d6-8b4776deda52.jpg?w=300 300w, https://github.blog/wp-content/uploads/2026/11/680960714-f07967c3-c256-495b-83d6-8b4776deda52.jpg?w=1600 1600w, https://github.blog/wp-content/uploads/2026/11/680960714-f07967c3-c256-495b-83d6-8b4776deda52.jpg?w=800 800w, https://github.blog/wp-content/uploads/2026/11/680960714-f07967c3-c256-495b-83d6-8b4776deda52.jpg?w=400 400w, https://github.blog/wp-content/uploads/2026/11/680960714-f07967c3-c256-495b-83d6-8b4776deda52.jpg?w=1032 1032w, https://github.blog/wp-content/uploads/2026/11/680960714-f07967c3-c256-495b-83d6-8b4776deda52.jpg?w=516 516w" sizes="(max-width: 2064px) 100vw, 2064px">				
	</div>
</header>
					</div>
	</div>
			<scroll-past data-attribute="stuck" data-ignore-if-attribute="prevent-stuck" data-controls=".PostContent-toc-top" data-offset="--header-offset"></scroll-past>
	<div class="PostContent-toc-top" data-target="table-of-contents.container">
		<div aria-hidden="true" class="TableOfContents-backdrop" data-target="table-of-contents.close-action"></div>
				</div>
		<div class="container-xl p-responsive-blog">
		<div class="PostContent">
			<div class="PostContent-aside">
			</div>
			<div class="PostContent-main editorial-content-block js-table-of-contents-source">
				
<p>Copilot Automations can now learn from their outcomes and propose improvements to themselves, helping them produce better results over time.</p>
<p>It’s easy to create an automation, but harder to build one you can trust to consistently produce high-quality results. Reviewing its output and improving its prompt by hand takes time. Self-improvement uses feedback from real outcomes on GitHub to make that process easier.</p>
<h2 id="how-it-works"><a class="heading-link" href="#how-it-works">How it works<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Your automations leave a trail of signals on GitHub that show how well they’re working. For example:</p>
<ul>
<li>An issue triage automation can learn from whether people change the labels it applied.</li>
<li>A code review automation can learn from whether developers accept its comments.</li>
<li>A performance optimization automation can learn from whether maintainers merge the pull requests it opens.</li>
</ul>
<p>Self-improving automations use these signals to propose improvements to their prompts. You stay in control: each proposed change comes to you for review before it’s applied.</p>
<h3 id="how-copilot-creates-a-self-improvement-loop"><a class="heading-link" href="#how-copilot-creates-a-self-improvement-loop">How Copilot creates a self-improvement loop<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>When you ask Copilot to set up a self-improving automation, it can create a group of automations that work together. For example, for a custom code reviewer, Copilot might create:</p>
<ul>
<li>A review automation that runs when a pull request is opened, reviews the changes, and posts comments.</li>
<li>A weekly improvement automation that analyzes how developers responded to those comments and proposes refinements to the review automation.</li>
</ul>
<p>When the improvement automation proposes a change to the original automation’s prompt, tools, or triggers, GitHub notifies you. You can review and accept or reject the proposed change before it is applied.</p>
<p>To learn more, see <a href="https://docs.github.com/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/about-automations?utm_source=automation-outcomes-changelog-overview-docs&amp;utm_medium=changelog&amp;utm_campaign=universe-2026">about Copilot Automations</a>.</p>
<p>Copilot Automations is available with Copilot Pro, Pro+, Max, Business, and Enterprise plans.</p>
<p>Join the discussion within <a href="https://github.com/orgs/community/discussions/211007?utm_source=automation-outcomes-changelog-community-discussion&amp;utm_medium=changelog&amp;utm_campaign=universe-2026">GitHub Community</a>.</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
							</div>
		</div>
		<footer class="PostMeta">
	<manage-more class="Tags--lg">
			<a href="https://github.blog/changelog/2026/?label=copilot" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: copilot; ref_location:post footer;">copilot</a>
			<a href="https://github.blog/changelog/2026/?label=universe26" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: universe26; ref_location:post footer;">universe26</a>
		<button type="button" slot="more" class="Tag Tag--lg Tag--lg-more" aria-expanded="false" aria-label="Show all tags" hidden="" data-analytics-click="Changelog, click on button to expand, text: Show all tags; ref_location:post footer;"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 14a2 2 0 1 1-.001-3.999A2 2 0 0 1 20 14ZM6 12a2 2 0 1 1-3.999.001A2 2 0 0 1 6 12Zm8 0a2 2 0 1 1-3.999.001A2 2 0 0 1 14 12Z"></path></svg></button>
</manage-more>
	<share-link role="button" tabindex="0" data-state="share" class="EditorialButton EditorialButton--sm EditorialButton--light" data-analytics-click="Changelog, click on button, text: Share; ref_location:post footer;">
	<span class="ShareButton-share">Share</span>
	<span class="ShareButton-copied">Copied</span>
	<span class="ShareButton-shared">Shared</span>
	<svg class="ShareButton-share" fill="none" height="14" viewBox="0 0 14 14" width="14" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m6.77518 2.27518c-.13248.14217-.20461.33022-.20118.52452s.08214.37968.21955.5171c.13742.13741.3228.21612.5171.21955s.38235-.06869.52453-.20117l1.25-1.25c.1858-.18582.4064-.33323.6492-.43379.2428-.10057.50302-.15233.76582-.15233s.523.05176.7658.15233c.2428.10056.4634.24797.6492.43379s.3332.40642.4338.6492c.1005.24279.1523.50301.1523.7658s-.0518.523-.1523.76579c-.1006.24278-.248.46338-.4338.64921l-2.50002 2.5c-.1858.18595-.4063.33347-.64912.43411-.2428.10065-.50305.15246-.76588.15246-.26284 0-.52309-.05181-.76589-.15246-.24279-.10064-.46337-.24816-.64911-.43411-.14218-.13248-.33023-.20461-.52453-.20118s-.37968.08214-.5171.21955c-.13741.13742-.21612.3228-.21955.5171s.0687.38235.20118.52453c.32501.32504.71086.5829 1.13552.7588s.87982.2664 1.33948.2664c.45965 0 .91481-.0905 1.3395-.2664.4246-.1759.81052-.43376 1.13552-.7588l2.5-2.5c.6564-.65642 1.0252-1.5467 1.0252-2.475 0-.92831-.3688-1.81859-1.0252-2.475-.6564-.656417-1.5467-1.02518-2.475-1.02518-.92832 0-1.81861.368763-2.47503 1.02518zm-4.69 9.64002c-.18596-.1858-.33348-.4063-.43412-.6491-.10065-.2428-.15246-.5031-.15246-.7659s.05181-.52312.15246-.76592c.10064-.2428.24816-.4634.43412-.6491l2.5-2.5c.18574-.18596.40632-.33348.64911-.43412.2428-.10065.50305-.15246.76589-.15246.26283 0 .52308.05181.76588.15246.24279.10064.46337.24816.64912.43412.14217.13248.33022.2046.52452.20117s.37968-.08214.5171-.21955c.13741-.13742.21612-.3228.21955-.5171s-.06869-.38235-.20117-.52452c-.32501-.32505-.71087-.58289-1.13553-.7588s-.87982-.26646-1.33947-.26646c-.45966 0-.91482.09055-1.33948.26646s-.81051.43375-1.13552.7588l-2.5 2.49999c-.656417.65642-1.02518 1.54671-1.02518 2.47503 0 .9283.368763 1.8186 1.02518 2.475.65641.6564 1.54669 1.0252 2.475 1.0252.9283 0 1.81858-.3688 2.475-1.0252l1.25-1.25c.13248-.1422.2046-.3302.20117-.5245s-.08214-.3797-.21955-.5171c-.13742-.1374-.3228-.2162-.5171-.2196s-.38235.0687-.52452.2012l-1.25 1.25c-.18575.1859-.40633.3335-.64912.4341-.2428.1007-.50305.1525-.76588.1525-.26284 0-.52309-.0518-.76589-.1525-.24279-.1006-.46337-.2482-.64911-.4341z" fill="currentColor" fill-rule="evenodd"></path></svg>
	<svg class="ShareButton-success-icon" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M13.7808 4.71934C13.9212 4.85996 14.0001 5.05059 14.0001 5.24934C14.0001 5.44809 13.9212 5.63871 13.7808 5.77934L6.53083 13.0293C6.3902 13.1697 6.19958 13.2486 6.00083 13.2486C5.80208 13.2486 5.61145 13.1697 5.47083 13.0293L2.22083 9.77934C2.08835 9.63716 2.01623 9.44912 2.01965 9.25481C2.02308 9.06051 2.10179 8.87513 2.23921 8.73771C2.37662 8.6003 2.56201 8.52159 2.75631 8.51816C2.95061 8.51473 3.13865 8.58686 3.28083 8.71934L6.00083 11.4393L12.7208 4.71934C12.8614 4.57889 13.052 4.5 13.2508 4.5C13.4495 4.5 13.6402 4.57889 13.7808 4.71934Z" fill="currentColor"></path>
	</svg>                
</share-link>
				<a href="https://github.blog/changelog/" style="padding-top: 0; padding-bottom: 0;" class="BackLink LinkMono LinkMono--muted" data-analytics-click="Changelog, click on back link, text: Back to changelog; ref_location:changelog post footer;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"></path></svg>
				<span class="LinkUnderline">Back to changelog</span>
			</a>
</footer>	</div>
