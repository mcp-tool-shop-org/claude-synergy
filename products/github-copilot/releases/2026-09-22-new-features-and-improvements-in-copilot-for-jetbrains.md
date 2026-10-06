---
product: github-copilot
version: "2026-09-22-new-features-and-improvements-in-copilot-for-jetbrains"
released_at: "2026-09-22"
source_url: "https://github.blog/changelog/2026-09-22-new-features-and-improvements-in-copilot-for-jetbrains"
fetched_at: "2026-10-06"
title: "New features and improvements in Copilot for JetBrains"
---

# github-copilot — New features and improvements in Copilot for JetBrains

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
				<span class="Tag Tag--type">Release</span>
			</div>
				<div class="Text-monospace ChangelogHeader-single-meta">
	<time datetime="2026-09-22">
	September 22, 2026</time>			•
		2 minute read	</div>
		<h1 class="Heading--2">New features and improvements in Copilot for JetBrains</h1>
	</div>
	
	<div class="ChangelogFeaturedImage">
					<img src="https://github.blog/wp-content/themes/github-2021-child/assets/img/featured-v3-new-releases.svg" width="1032" height="285" alt="" aria-hidden="true">
				
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
					<a href="#whats-new" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>What's new</span>
					</a>
				</li>
							<li>
					<a href="#user-experience-enhancements" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>User experience enhancements</span>
					</a>
				</li>
							<li>
					<a href="#quality-improvements" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Quality improvements</span>
					</a>
				</li>
							<li>
					<a href="#changed" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Changed</span>
					</a>
				</li>
							<li>
					<a href="#deprecation" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Deprecation</span>
					</a>
				</li>
							<li>
					<a href="#try-it-out" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Try it out</span>
					</a>
				</li>
							<li>
					<a href="#share-your-feedback" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Share your feedback</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">What's new</span></div>
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
									<a href="#whats-new" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>What's new</span>
									</a>
								</li>
															<li>
									<a href="#user-experience-enhancements" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>User experience enhancements</span>
									</a>
								</li>
															<li>
									<a href="#quality-improvements" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Quality improvements</span>
									</a>
								</li>
															<li>
									<a href="#changed" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Changed</span>
									</a>
								</li>
															<li>
									<a href="#deprecation" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Deprecation</span>
									</a>
								</li>
															<li>
									<a href="#try-it-out" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Try it out</span>
									</a>
								</li>
															<li>
									<a href="#share-your-feedback" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Share your feedback</span>
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
				
<p>GitHub Copilot for JetBrains 1.18.0 brings AI-assisted tool approvals, more control over agent conversations, and shared skills and instructions for your organization. You can also review plans with the Codex agent and manage MCP tools with persistent controls.</p>
<h2 id="whats-new"><a class="heading-link" href="#whats-new">What’s new<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<h3 id="ai-assisted-tool-approvals"><a class="heading-link" href="#ai-assisted-tool-approvals">AI-assisted tool approvals<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>AI-assisted tool approvals, called assisted approvals, are now in public preview for Copilot agent sessions. Low-risk tool calls receive automatic approval, while higher-risk actions continue to prompt you for a decision.</p>
<p>This gives you fewer approval interruptions for low-risk actions while keeping higher-risk decisions in your hands.</p>
<h3 id="re-edit-earlier-messages"><a class="heading-link" href="#re-edit-earlier-messages">Re-edit earlier messages<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>You can now re-edit a previous user message in a Copilot agent session. Before sending your replacement message, Copilot rewinds both the conversation and file changes.</p>
<p>This lets you revise an earlier request and continue from that point, rather than adding another message to correct the direction of the conversation.</p>
<h3 id="shared-skills-and-instructions"><a class="heading-link" href="#shared-skills-and-instructions">Shared skills and instructions<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Local and Copilot agent sessions now support organization and enterprise skills, along with organization-managed custom instructions. You can use shared skills and organizational guidance in both types of sessions.</p>
<h3 id="plan-with-the-codex-agent"><a class="heading-link" href="#plan-with-the-codex-agent">Plan with the Codex agent<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>The Codex agent now supports plan mode. You can review, refine, or approve a plan before implementation, giving you an opportunity to shape the approach before the agent starts making changes.</p>
<h3 id="more-control-over-mcp-tools"><a class="heading-link" href="#more-control-over-mcp-tools">More control over MCP tools<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>A new setting lets you turn the built-in GitHub MCP Server on or off without changing manually configured MCP servers. The built-in server remains enabled by default.</p>
<p>Copilot agent sessions also gain persistent per-tool controls for MCP servers. You can manage individual tools as well as control whether the built-in server is enabled.</p>
<h2 id="user-experience-enhancements"><a class="heading-link" href="#user-experience-enhancements">User experience enhancements<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<h3 id="chat-alongside-your-sessions"><a class="heading-link" href="#chat-alongside-your-sessions">Chat alongside your sessions<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>A new side-by-side chat panel switcher in the session toolbar lets you chat in the editor while browsing sessions in the tool window. You can keep your conversation open alongside the session list.</p>
<p>Other updates make features and settings easier to discover:</p>
<ul>
<li>Added browsable usage tips above the chat input with shortcuts to commands, customizations, and settings</li>
<li>Simplified the chat welcome screen and added a direct feedback link</li>
<li>Labeled the built-in GitHub MCP Server in the tool configuration interface and added a direct link to its settings</li>
<li>Restored shortcuts for updating agent instructions and viewing usage-based billing best practices</li>
<li>Clarified the <code>/init</code> tip and grouped it with customizations</li>
</ul>
<h2 id="quality-improvements"><a class="heading-link" href="#quality-improvements">Quality improvements<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>This update improves inline chat reliability, including preserving your edits when requests end and respecting selected thinking effort and context window settings. It also addresses Codex session startup issues, improves behavior across multiple project windows, and restores embedded editors and message re-editing on IntelliJ 2026.3 EAP builds.</p>
<h2 id="changed"><a class="heading-link" href="#changed">Changed<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Inline chat and its entry points are now hidden in JetBrains Gateway and remote development environments.</p>
<h2 id="deprecation"><a class="heading-link" href="#deprecation">Deprecation<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>If you use a JetBrains IDE version 2025.1, you will see advance notice to upgrade to 2026.1 or later. Support remains unchanged in this release.</p>
<h2 id="try-it-out"><a class="heading-link" href="#try-it-out">Try it out<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>We encourage you to try out the <a href="https://plugins.jetbrains.com/plugin/17718-github-copilot--your-ai-pair-programmer/versions">latest version of the GitHub Copilot plugin</a> and share your feedback. Your input is invaluable in helping us refine and improve the product.</p>
<h2 id="share-your-feedback"><a class="heading-link" href="#share-your-feedback">Share your feedback<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Your feedback drives improvements. We’d love to hear about your experience in the following channels:</p>
<ul>
<li>In-product feedback: Use the feedback options within your IDE.</li>
<li>Feedback repository: Share your thoughts in the <a href="https://github.com/microsoft/copilot-intellij-feedback/issues">GitHub Copilot for JetBrains IDEs issues</a>.</li>
</ul>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#whats-new" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>What's new</span>
					</a>
				</li>
							<li>
					<a href="#user-experience-enhancements" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>User experience enhancements</span>
					</a>
				</li>
							<li>
					<a href="#quality-improvements" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Quality improvements</span>
					</a>
				</li>
							<li>
					<a href="#changed" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Changed</span>
					</a>
				</li>
							<li>
					<a href="#deprecation" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Deprecation</span>
					</a>
				</li>
							<li>
					<a href="#try-it-out" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Try it out</span>
					</a>
				</li>
							<li>
					<a href="#share-your-feedback" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Share your feedback</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">What's new</span></div>
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
									<a href="#whats-new" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>What's new</span>
									</a>
								</li>
															<li>
									<a href="#user-experience-enhancements" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>User experience enhancements</span>
									</a>
								</li>
															<li>
									<a href="#quality-improvements" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Quality improvements</span>
									</a>
								</li>
															<li>
									<a href="#changed" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Changed</span>
									</a>
								</li>
															<li>
									<a href="#deprecation" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Deprecation</span>
									</a>
								</li>
															<li>
									<a href="#try-it-out" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Try it out</span>
									</a>
								</li>
															<li>
									<a href="#share-your-feedback" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Share your feedback</span>
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
