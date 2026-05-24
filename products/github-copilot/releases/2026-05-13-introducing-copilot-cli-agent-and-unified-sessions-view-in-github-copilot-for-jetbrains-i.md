---
product: github-copilot
version: "2026-05-13-introducing-copilot-cli-agent-and-unified-sessions-view-in-github-copilot-for-jetbrains-i"
released_at: "2026-05-13"
source_url: "https://github.blog/changelog/2026-05-13-introducing-copilot-cli-agent-and-unified-sessions-view-in-github-copilot-for-jetbrains-ides"
fetched_at: "2026-05-24"
title: "Introducing Copilot CLI agent and unified sessions view in GitHub Copilot for JetBrains IDEs"
---

# github-copilot — Introducing Copilot CLI agent and unified sessions view in GitHub Copilot for JetBrains IDEs

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
	<time datetime="2026-05-13">
	May 13, 2026</time>			•
		3 minute read	</div>
		<h1 class="Heading--2">Introducing Copilot CLI agent and unified sessions view in GitHub Copilot for JetBrains IDEs</h1>
	</div>
	
	<div class="ChangelogFeaturedImage">
					<img src="https://github.blog/wp-content/themes/github-2021-child/assets/img/featured-v3-improvements.svg" width="1032" height="285" alt="" aria-hidden="true">
				
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
					<a href="#new-features" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>New features</span>
					</a>
				</li>
							<li>
					<a href="#user-experience" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>User experience</span>
					</a>
				</li>
							<li>
					<a href="#reliability-improvements" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Reliability improvements</span>
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
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">New features</span></div>
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
									<a href="#new-features" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>New features</span>
									</a>
								</li>
															<li>
									<a href="#user-experience" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>User experience</span>
									</a>
								</li>
															<li>
									<a href="#reliability-improvements" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Reliability improvements</span>
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
				
<p>This update brings the Copilot CLI agent into JetBrains IDEs, along with a unified sessions view that shows live status for running and queued sessions. It also adds the ask question tool in agent mode, improves sign-in for GitHub Enterprise Server (GHES), adds global <code>.agent.md</code> support, and delivers several user experience improvements.</p>
<h2 id="new-features"><a class="heading-link" href="#new-features">New features<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<h3 id="github-copilot-cli-agent-in-public-preview"><a class="heading-link" href="#github-copilot-cli-agent-in-public-preview">GitHub Copilot CLI agent in public preview<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>You can now delegate tasks from JetBrains IDEs to a locally running GitHub Copilot CLI agent in public preview. This brings the same long-running, terminal-based agent into the IDE, with editor context already connected.</p>
<p>The agent supports multiple isolation modes to control how changes are applied:</p>
<ul>
<li><strong>Worktree isolation</strong> runs the agent in a separate Git worktree, so changes don’t affect your current branch until you choose to review and apply them.</li>
<li><strong>Workspace isolation</strong> applies changes directly to your current workspace, allowing for faster iteration when isolation isn’t required.</li>
</ul>
<p>While running, the session shows both live progress and tool calls, and it ends with a summary of changes and updated files. To get started, select <strong>Copilot CLI</strong> from the agent picker in chat, choose a model, pick an isolation mode if needed, and send your prompt.</p>
<p><img decoding="async" loading="lazy" alt="Walkthrough of delegating a task to Copilot CLI in JetBrains IDEs" src="https://github.com/user-attachments/assets/d4318c25-dd11-42f7-af42-7fa250d5d3b7"></p>
<p>Note: If you are a Copilot Business or Copilot Enterprise subscriber, an administrator will have to enable the Editor preview features policy before you can use this feature.</p>
<h3 id="unified-sessions-view"><a class="heading-link" href="#unified-sessions-view">Unified sessions view<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>The chat window now includes a unified sessions view, making it easier to track all agent sessions in one place. Each session shows its title, agent type, elapsed time, and status. You can also filter sessions by agent type or status to quickly find what you’re looking for.</p>
<p><img decoding="async" loading="lazy" alt="Demo of managing sessions in the unified sessions view in JetBrains IDEs" src="https://github.com/user-attachments/assets/23de24f9-6146-4b3b-85cd-8131f26867ea"></p>
<h3 id="ask-question-tool"><a class="heading-link" href="#ask-question-tool">Ask question tool<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Agent mode now includes an Ask question tool, enabling agents to ask focused clarifying questions when additional information is needed. This helps reduce ambiguity and improves task accuracy. This is supported across agent mode, custom agents, sub agents, and Copilot CLI agent, and it’s not available in Ask mode.</p>
<p><img decoding="async" loading="lazy" alt="Demo of creating a todo app with the Ask question tool" src="https://github.com/user-attachments/assets/bf01e590-052c-412a-9e81-035111da6c39"></p>
<h3 id="global-agent-md-support-in-copilot-agents"><a class="heading-link" href="#global-agent-md-support-in-copilot-agents">Global <code>.agent.md</code> support in <code>~/.copilot/agents</code><span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>In addition to workspace-level configuration, you can now define custom agents at the global level using the <code>.agent.md</code> file under <code>~/.copilot/agents</code>, making them available across all your workspaces. In-product support for managing global agents is coming in a future release.</p>
<p><img decoding="async" loading="lazy" alt="Demo of creating global custom agents in JetBrains IDEs" src="https://github.com/user-attachments/assets/670d59ce-07cf-4573-9ab6-1be9a44135f7"></p>
<h3 id="github-enterprise-server-ghes-support-in-sign-in-flow"><a class="heading-link" href="#github-enterprise-server-ghes-support-in-sign-in-flow">GitHub Enterprise Server (GHES) support in sign-in flow<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>GitHub Enterprise Server (GHES) is now supported in the sign-in flow. When signing in, select <strong>Continue with GitHub Enterprise</strong> to choose your enterprise type and authenticate with your enterprise instance using a hostname or URL.</p>
<h2 id="user-experience"><a class="heading-link" href="#user-experience">User experience<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>We’ve also made several workflow and interaction improvements across JetBrains IDEs:</p>
<ul>
<li>Added confirmation when starting a new command to cancel the active one.</li>
<li>Improved sub-agent rendering and styling for current file context.</li>
<li>Improved auto-approval panel UI.</li>
<li>Improved hover and pressed states for code block actions.</li>
<li>Improved code review apply behavior with full-line replacements.</li>
</ul>
<h2 id="reliability-improvements"><a class="heading-link" href="#reliability-improvements">Reliability improvements<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Reliability remains one of our key priorities, and this release includes additional improvements to stability and responsiveness:</p>
<ul>
<li>Resolved an issue where code completions would not work on a second screen.</li>
<li>Fixed <strong>Shift+Home</strong> and <strong>Shift+End</strong> issues for inline selection.</li>
<li>Improved drag-and-drop behavior when adding files to Copilot Chat.</li>
<li>Improved UI responsiveness and reduced occasional freezes.</li>
</ul>
<h2 id="changed"><a class="heading-link" href="#changed">Changed<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>The plan agent is no longer auto-invoked in sub-agent workflows. It remains available from the mode picker when you want to use it.</p>
<h2 id="deprecation"><a class="heading-link" href="#deprecation">Deprecation<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Edit mode support has been removed.</p>
<h2 id="try-it-out"><a class="heading-link" href="#try-it-out">Try it out<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>We encourage you to try out the <a href="https://plugins.jetbrains.com/plugin/17718-github-copilot--your-ai-pair-programmer/versions">latest version of the GitHub Copilot plugin</a> and share your feedback. Your input is invaluable in helping us refine and improve the product.</p>
<h2 id="share-your-feedback"><a class="heading-link" href="#share-your-feedback">Share your feedback<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Your feedback drives improvements. We’d love to hear about your experience in the following channels:</p>
<ul>
<li><strong>In-product feedback:</strong> Use the feedback options within your IDE.</li>
<li><strong>Feedback repository:</strong> Share your thoughts in the <a href="https://github.com/microsoft/copilot-intellij-feedback/issues">GitHub Copilot for JetBrains IDEs issues</a>.</li>
</ul>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#new-features" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>New features</span>
					</a>
				</li>
							<li>
					<a href="#user-experience" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>User experience</span>
					</a>
				</li>
							<li>
					<a href="#reliability-improvements" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Reliability improvements</span>
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
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">New features</span></div>
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
									<a href="#new-features" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>New features</span>
									</a>
								</li>
															<li>
									<a href="#user-experience" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>User experience</span>
									</a>
								</li>
															<li>
									<a href="#reliability-improvements" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Reliability improvements</span>
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
