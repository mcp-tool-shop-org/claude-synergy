---
product: github-copilot
version: "2026-11-06-github-copilot-weekly-releases-november-2"
released_at: "2026-11-06"
source_url: "https://github.blog/changelog/2026-11-06-github-copilot-weekly-releases-november-2"
fetched_at: "2026-11-07"
title: "GitHub Copilot weekly releases — November 2"
---

# github-copilot — GitHub Copilot weekly releases — November 2

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
	<time datetime="2026-11-06">
	November 6, 2026</time>			•
		2 minute read	</div>
		<h1 class="Heading--2">GitHub Copilot weekly releases — November 2</h1>
	</div>
	
	<div class="ChangelogFeaturedImage">
					<svg aria-hidden="true" width="2064" height="848" role="presentation"></svg>
			<img width="2064" height="848" src="https://github.blog/wp-content/uploads/2026/11/649772462-cd2b8dcf-4eac-422d-81a2-5e9ef2709240.jpg?resize=2064%2C848" class="CoverImage wp-post-image" alt="Small text on the left side that says &quot;GITHUB COPILOT&quot; with larger text underneath it that says &quot;Weekly releases&quot;. On the right side is the GitHub Copilot logo." decoding="async" fetchpriority="high" srcset="https://github.blog/wp-content/uploads/2026/11/649772462-cd2b8dcf-4eac-422d-81a2-5e9ef2709240.jpg?w=2064 2064w, https://github.blog/wp-content/uploads/2026/11/649772462-cd2b8dcf-4eac-422d-81a2-5e9ef2709240.jpg?w=300 300w, https://github.blog/wp-content/uploads/2026/11/649772462-cd2b8dcf-4eac-422d-81a2-5e9ef2709240.jpg?w=768 768w, https://github.blog/wp-content/uploads/2026/11/649772462-cd2b8dcf-4eac-422d-81a2-5e9ef2709240.jpg?w=1024 1024w, https://github.blog/wp-content/uploads/2026/11/649772462-cd2b8dcf-4eac-422d-81a2-5e9ef2709240.jpg?w=1536 1536w, https://github.blog/wp-content/uploads/2026/11/649772462-cd2b8dcf-4eac-422d-81a2-5e9ef2709240.jpg?w=2048 2048w" sizes="(max-width: 2064px) 100vw, 2064px">				
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
					<a href="#github-copilot-app" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot app</span>
					</a>
				</li>
							<li>
					<a href="#github-copilot-cli" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot CLI</span>
					</a>
				</li>
							<li>
					<a href="#github-copilot-in-jetbrains" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot in JetBrains</span>
					</a>
				</li>
							<li>
					<a href="#github-copilot-in-xcode" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot in Xcode</span>
					</a>
				</li>
							<li>
					<a href="#github-copilot-in-vs-code-1-145-release" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot in VS Code (1.145 release)</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">GitHub Copilot app</span></div>
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
									<a href="#github-copilot-app" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot app</span>
									</a>
								</li>
															<li>
									<a href="#github-copilot-cli" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot CLI</span>
									</a>
								</li>
															<li>
									<a href="#github-copilot-in-jetbrains" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot in JetBrains</span>
									</a>
								</li>
															<li>
									<a href="#github-copilot-in-xcode" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot in Xcode</span>
									</a>
								</li>
															<li>
									<a href="#github-copilot-in-vs-code-1-145-release" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot in VS Code (1.145 release)</span>
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
				
<p>This week, Copilot comes to JetBrains Air and Xcode’s coding assistant, with updates to help you manage pull requests, settings, and agent sessions.</p>
<h3 id="github-copilot-app"><a class="heading-link" href="#github-copilot-app">GitHub Copilot app<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<ul>
<li>Set up Agent Merge directly from a pull request to have Copilot merge it when it’s ready. It now stays enabled while required checks or rules are pending. You can also check reviewer status, request additional reviews, and select comment text to quote it or discuss it with Copilot.</li>
<li>Keep working when a conversation reaches its context limit. Compact the conversation or review what’s using the available space directly from the error.</li>
<li>Start a session by dropping files on “New” in the sidebar. CSV and TSV files now open as tables with sticky headers and an option to view the source.</li>
<li>Manage sessions in fewer steps. Archive pinned sessions whose pull requests have merged or closed, pin or unpin multiple sessions, and separate nested chats without losing the conversation. My Work now supports more than ten saved custom views.</li>
<li>Give Copilot guidance on which tool requests to approve without asking you. Personal instructions for assisted approval are opt-in and apply to local sessions.</li>
</ul>
<p>Install the <a href="https://gh.io/app">GitHub Copilot app</a>.</p>
<h3 id="github-copilot-cli"><a class="heading-link" href="#github-copilot-cli">GitHub Copilot CLI<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Manage your whole setup in one place. <code>/settings</code> now opens a unified dashboard for your plugins, MCP servers, and more, and you can search across all of your settings.</p>
<p><video loop="" controls="" autoplay="" muted="" width="100%" aria-label="Searching and changing settings in the Copilot CLI /settings dashboard" src="https://github.com/user-attachments/assets/15b79c23-aac2-4a58-83c5-eed8f53c5625"><br>
</video></p>
<p>Install <a href="https://github.com/features/copilot/cli?utm_source=install-cli-09-07&amp;utm_medium=changelog&amp;utm_campaign=weekly-copilot-launches-aug-2026">Copilot CLI</a>.</p>
<h3 id="github-copilot-in-jetbrains"><a class="heading-link" href="#github-copilot-in-jetbrains">GitHub Copilot in JetBrains<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Introducing a new way to use GitHub Copilot in JetBrains IDEs, with Copilot now available in JetBrains Air. Track multiple agent sessions and run tasks locally in your JetBrains IDE or in the cloud through Air Teams, using your existing Copilot subscription.</p>
<p>Get started with <a href="https://github.blog/changelog/2026-11-03-github-copilot-is-now-available-in-jetbrains-air/">Copilot in JetBrains Air</a>.</p>
<h3 id="github-copilot-in-xcode"><a class="heading-link" href="#github-copilot-in-xcode">GitHub Copilot in Xcode<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>You can now work with GitHub Copilot directly in Xcode’s built-in coding assistant, bringing Copilot into your native Xcode workflow. The integration is now in public preview, available starting with Xcode 27.3 beta.</p>
<p>Get started with <a href="https://github.blog/changelog/2026-11-04-github-copilot-is-now-available-in-xcodes-coding-assistant/">Copilot in Xcode</a>.</p>
<h3 id="github-copilot-in-vs-code-1-145-release"><a class="heading-link" href="#github-copilot-in-vs-code-1-145-release">GitHub Copilot in VS Code (1.145 release)<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<ul>
<li>Follow the conversation without the clutter or, alternatively, choose to inspect every step. Experimental chat view modes let you collapse or expand reasoning and tool calls without starting a new conversation.</li>
</ul>
<p><video loop="" controls="" autoplay="" muted="" width="100%" aria-label="VS Code Conversation, Verbose, and Compact chat views side by side" src="https://github.com/user-attachments/assets/5c8d704b-a308-49d1-9613-e1f2edecc7e7"><br>
</video></p>
<ul>
<li>Check an agent’s work on another machine without leaving VS Code. Preview remote apps and use interactive canvases in the Agents window, now in preview. Enable remote browser support in settings, plus canvases to use that feature.<br>
<img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/383a4f6c-9d55-4282-b586-006e9e02b985" alt="Browser conected to a remote host"></li>
<li>Run recurring tasks on a schedule that fits your workflow. Local automations now support cron expressions and custom agents from your workspace.<br>
<img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/20e33f0a-b958-4553-89dc-bd956937fef9" alt="cron job running in vs code"></li>
<li>Bring screenshots, mockups, and other files into chat without moving them into your workspace. Choose them with <strong>Add Context</strong> &gt; <strong>Files</strong>. Cloud sessions only support images.</li>
<li>Get back into long Copilot chats more smoothly. Past terminal output now renders as you expand or reveal it instead of loading all at once.</li>
</ul>
<p>Explore everything that’s new in the <a href="https://code.visualstudio.com/updates/v1_145">full release notes</a>.</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#github-copilot-app" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot app</span>
					</a>
				</li>
							<li>
					<a href="#github-copilot-cli" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot CLI</span>
					</a>
				</li>
							<li>
					<a href="#github-copilot-in-jetbrains" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot in JetBrains</span>
					</a>
				</li>
							<li>
					<a href="#github-copilot-in-xcode" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot in Xcode</span>
					</a>
				</li>
							<li>
					<a href="#github-copilot-in-vs-code-1-145-release" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>GitHub Copilot in VS Code (1.145 release)</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">GitHub Copilot app</span></div>
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
									<a href="#github-copilot-app" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot app</span>
									</a>
								</li>
															<li>
									<a href="#github-copilot-cli" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot CLI</span>
									</a>
								</li>
															<li>
									<a href="#github-copilot-in-jetbrains" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot in JetBrains</span>
									</a>
								</li>
															<li>
									<a href="#github-copilot-in-xcode" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot in Xcode</span>
									</a>
								</li>
															<li>
									<a href="#github-copilot-in-vs-code-1-145-release" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>GitHub Copilot in VS Code (1.145 release)</span>
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
