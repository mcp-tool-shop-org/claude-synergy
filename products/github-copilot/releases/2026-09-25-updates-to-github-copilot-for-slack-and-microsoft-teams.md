---
product: github-copilot
version: "2026-09-25-updates-to-github-copilot-for-slack-and-microsoft-teams"
released_at: "2026-09-25"
source_url: "https://github.blog/changelog/2026-09-25-updates-to-github-copilot-for-slack-and-microsoft-teams"
fetched_at: "2026-10-06"
title: "Updates to GitHub Copilot for Slack and Microsoft Teams"
---

# github-copilot — Updates to GitHub Copilot for Slack and Microsoft Teams

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
	<time datetime="2026-09-25">
	September 25, 2026</time>			•
		2 minute read	</div>
		<h1 class="Heading--2">Updates to GitHub Copilot for Slack and Microsoft Teams</h1>
	</div>
	
	<div class="ChangelogFeaturedImage">
					<svg aria-hidden="true" width="2064" height="1330" role="presentation"></svg>
			<img width="2064" height="1096" src="https://github.blog/wp-content/uploads/2026/09/Changelog_Improvement_Headers_GitHubSlackTeamsUpdate-1.jpg?resize=2064%2C1096" class="CoverImage wp-post-image" alt="" decoding="async" fetchpriority="high" srcset="https://github.blog/wp-content/uploads/2026/09/Changelog_Improvement_Headers_GitHubSlackTeamsUpdate-1.jpg?w=1600 1600w, https://github.blog/wp-content/uploads/2026/09/Changelog_Improvement_Headers_GitHubSlackTeamsUpdate-1.jpg?w=800 800w, https://github.blog/wp-content/uploads/2026/09/Changelog_Improvement_Headers_GitHubSlackTeamsUpdate-1.jpg?w=400 400w, https://github.blog/wp-content/uploads/2026/09/Changelog_Improvement_Headers_GitHubSlackTeamsUpdate-1.jpg?w=1032 1032w, https://github.blog/wp-content/uploads/2026/09/Changelog_Improvement_Headers_GitHubSlackTeamsUpdate-1.jpg?w=516 516w" sizes="(max-width: 2064px) 100vw, 2064px">				
	</div>
</header>
					</div>
	</div>
			<scroll-past data-attribute="stuck" data-ignore-if-attribute="prevent-stuck" data-controls=".PostContent-toc-top" data-offset="--header-offset"></scroll-past>
	<div class="PostContent-toc-top" data-target="table-of-contents.container">
		<div aria-hidden="true" class="TableOfContents-backdrop" data-target="table-of-contents.close-action"></div>
			<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#better-context-for-the-work-youre-already-doing" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Better context for the work you’re already doing</span>
					</a>
				</li>
							<li>
					<a href="#more-control-over-how-you-work" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>More control over how you work</span>
					</a>
				</li>
							<li>
					<a href="#bug-fixes-and-reliability-improvements" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Bug fixes and reliability improvements</span>
					</a>
				</li>
							<li>
					<a href="#availability" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Availability</span>
					</a>
				</li>
							<li>
					<a href="#get-started-in-slack" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Get started in Slack</span>
					</a>
				</li>
							<li>
					<a href="#get-started-in-microsoft-teams" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Get started in Microsoft Teams</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Better context for the work you’re already doing</span></div>
				<div class="TableOfContents-summary-icon">
					<svg width="16" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M12.7803 5.71967C13.0732 6.01256 13.0732 6.48744 12.7803 6.78033L8.53033 11.0303C8.23744 11.3232 7.76256 11.3232 7.46967 11.0303L3.21967 6.78033C2.92678 6.48744 2.92678 6.01256 3.21967 5.71967C3.51256 5.42678 3.98744 5.42678 4.28033 5.71967L8 9.43934L11.7197 5.71967C12.0126 5.42678 12.4874 5.42678 12.7803 5.71967Z" fill="currentColor"></path>
					</svg>
				</div>
			</summary>
			<div class="ChangelogDialog-anim">
				<div class="ChangelogDialog-transform">
					<div class="TableOfContents-details-content">
						<ul class="TableOfContents">
															<li>
									<a href="#better-context-for-the-work-youre-already-doing" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Better context for the work you’re already doing</span>
									</a>
								</li>
															<li>
									<a href="#more-control-over-how-you-work" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>More control over how you work</span>
									</a>
								</li>
															<li>
									<a href="#bug-fixes-and-reliability-improvements" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Bug fixes and reliability improvements</span>
									</a>
								</li>
															<li>
									<a href="#availability" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Availability</span>
									</a>
								</li>
															<li>
									<a href="#get-started-in-slack" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Get started in Slack</span>
									</a>
								</li>
															<li>
									<a href="#get-started-in-microsoft-teams" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Get started in Microsoft Teams</span>
									</a>
								</li>
													</ul>
					</div>
				</div>
			</div>
		</details>
		<focus-trap tabindex="0" role="button" data-order="first"></focus-trap>
	</table-of-contents>
</nav>
	</div>
		<div class="container-xl p-responsive-blog">
		<div class="PostContent">
			<div class="PostContent-aside">
			</div>
			<div class="PostContent-main editorial-content-block js-table-of-contents-source">
				
<p>GitHub Copilot in Slack and Microsoft Teams now gives you more context, more control, and a clearer path from conversation to GitHub work.</p>
<p>Whether you’re sharing files in Slack or images and forwarded messages in Teams, Copilot can use more of the context already in your conversation. We’ve also improved how Copilot creates GitHub work and connects it back to the source discussion, so teams can more quickly see the context behind a decision.</p>
<h3 id="better-context-for-the-work-youre-already-doing"><a class="heading-link" href="#better-context-for-the-work-youre-already-doing">Better context for the work you’re already doing<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>You can now use supported Slack files, attachments, and message links as context. In Teams, Copilot can work with inline images, forwarded-message context, and channel and thread history. Copilot also checks for similar issues before creating a new one, includes direct links to the resulting work, and keeps a link back to the originating conversation so the context remains easy to trace.</p>
<h3 id="more-control-over-how-you-work"><a class="heading-link" href="#more-control-over-how-you-work">More control over how you work<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>You can switch models for the next message and keep that choice throughout the conversation. In Slack, you can also set default owners and repositories. This makes it easier to keep work moving across repositories and shared conversations.</p>
<h3 id="bug-fixes-and-reliability-improvements"><a class="heading-link" href="#bug-fixes-and-reliability-improvements">Bug fixes and reliability improvements<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>We’ve improved how Copilot handles longer-running tasks, including clearer implementation-plan status, better handling of interrupted or stale replies, and more predictable reconnection behavior when a conversation goes idle. In Microsoft Teams, Copilot now more reliably retains channel-thread history, avoids duplicate answers, correctly handles Teams-converted images, and works more consistently with user-owned repositories and large channels. In Slack, we improved implementation-plan recovery, fixed repository picker and code-channel issues, and made repository switching safer so superseded sessions cannot continue acting in the old repository. Across both experiences, Copilot now provides more accurate messages when a task stalls, a connection is interrupted, or access settings prevent work from continuing.</p>
<h3 id="availability"><a class="heading-link" href="#availability">Availability<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>The public preview is available to organizations on GitHub Copilot Business and GitHub Copilot Enterprise plans. Usage counts against your existing Copilot entitlements and can be managed with existing Copilot cloud agent budgets. Some capabilities are rolling out gradually and may not yet be available in every workspace.</p>
<h3 id="get-started-in-slack"><a class="heading-link" href="#get-started-in-slack">Get started in Slack<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<ol>
<li>Make sure an administrator has enabled the Copilot cloud agent policy for your organization.
</li>
<li>
<p>Install or upgrade the GitHub app for Slack.</p>
</li>
<li>
<p>Link your GitHub account and mention @GitHub in a conversation.</p>
</li>
</ol>
<p>For setup details and supported workflows, see <a href="https://docs.github.com/copilot/how-tos/use-copilot-agents/coding-agent/integrate-coding-agent-with-slack">how to use Copilot coding agent with Slack.</a></p>
<h3 id="get-started-in-microsoft-teams"><a class="heading-link" href="#get-started-in-microsoft-teams">Get started in Microsoft Teams<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<ol>
<li>Make sure an administrator has enabled GitHub Copilot cloud agent and cloud sandboxes.
</li>
<li>
<p>Install or upgrade the GitHub app for Microsoft Teams.</p>
</li>
<li>
<p>In Teams, mention @GitHub and follow the prompts to connect your GitHub account.</p>
</li>
</ol>
<p>For setup details and supported workflows, see <a href="https://docs.github.com/copilot/how-tos/copilot-integrations/integrate-cloud-agent-with-teams">how to integrate GitHub Copilot cloud agent with Microsoft Teams.</a></p>
<p>Join the discussion within <a href="https://github.com/orgs/community/discussions/categories/copilot-conversations">GitHub Community</a>.</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#better-context-for-the-work-youre-already-doing" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Better context for the work you’re already doing</span>
					</a>
				</li>
							<li>
					<a href="#more-control-over-how-you-work" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>More control over how you work</span>
					</a>
				</li>
							<li>
					<a href="#bug-fixes-and-reliability-improvements" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Bug fixes and reliability improvements</span>
					</a>
				</li>
							<li>
					<a href="#availability" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Availability</span>
					</a>
				</li>
							<li>
					<a href="#get-started-in-slack" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Get started in Slack</span>
					</a>
				</li>
							<li>
					<a href="#get-started-in-microsoft-teams" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Get started in Microsoft Teams</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Better context for the work you’re already doing</span></div>
				<div class="TableOfContents-summary-icon">
					<svg width="16" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M12.7803 5.71967C13.0732 6.01256 13.0732 6.48744 12.7803 6.78033L8.53033 11.0303C8.23744 11.3232 7.76256 11.3232 7.46967 11.0303L3.21967 6.78033C2.92678 6.48744 2.92678 6.01256 3.21967 5.71967C3.51256 5.42678 3.98744 5.42678 4.28033 5.71967L8 9.43934L11.7197 5.71967C12.0126 5.42678 12.4874 5.42678 12.7803 5.71967Z" fill="currentColor"></path>
					</svg>
				</div>
			</summary>
			<div class="ChangelogDialog-anim">
				<div class="ChangelogDialog-transform">
					<div class="TableOfContents-details-content">
						<ul class="TableOfContents">
															<li>
									<a href="#better-context-for-the-work-youre-already-doing" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Better context for the work you’re already doing</span>
									</a>
								</li>
															<li>
									<a href="#more-control-over-how-you-work" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>More control over how you work</span>
									</a>
								</li>
															<li>
									<a href="#bug-fixes-and-reliability-improvements" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Bug fixes and reliability improvements</span>
									</a>
								</li>
															<li>
									<a href="#availability" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Availability</span>
									</a>
								</li>
															<li>
									<a href="#get-started-in-slack" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Get started in Slack</span>
									</a>
								</li>
															<li>
									<a href="#get-started-in-microsoft-teams" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Get started in Microsoft Teams</span>
									</a>
								</li>
													</ul>
					</div>
				</div>
			</div>
		</details>
		<focus-trap tabindex="0" role="button" data-order="first"></focus-trap>
	</table-of-contents>
</nav>
			</div>
		</div>
		<footer class="PostMeta">
	<manage-more class="Tags--lg">
			<a href="https://github.blog/changelog/2026/?label=collaboration-tools" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: collaboration tools; ref_location:post footer;">collaboration tools</a>
			<a href="https://github.blog/changelog/2026/?label=copilot" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: copilot; ref_location:post footer;">copilot</a>
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
