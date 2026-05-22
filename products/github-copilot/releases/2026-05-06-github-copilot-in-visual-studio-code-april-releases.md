---
product: github-copilot
version: "2026-05-06-github-copilot-in-visual-studio-code-april-releases"
released_at: "2026-05-06"
source_url: "https://github.blog/changelog/2026-05-06-github-copilot-in-visual-studio-code-april-releases"
fetched_at: "2026-05-22"
title: "GitHub Copilot in Visual Studio Code, April releases"
---

# github-copilot — GitHub Copilot in Visual Studio Code, April releases

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
	<time datetime="2026-05-06">
	May 6, 2026</time>			•
		2 minute read	</div>
		<h1 class="Heading--2">GitHub Copilot in Visual Studio Code, April releases</h1>
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
					<a href="#smarter-context" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Smarter context</span>
					</a>
				</li>
							<li>
					<a href="#agent-experience" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Agent experience</span>
					</a>
				</li>
							<li>
					<a href="#chat-continuity" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Chat Continuity</span>
					</a>
				</li>
							<li>
					<a href="#also-new" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Also new</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Smarter context</span></div>
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
									<a href="#smarter-context" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Smarter context</span>
									</a>
								</li>
															<li>
									<a href="#agent-experience" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Agent experience</span>
									</a>
								</li>
															<li>
									<a href="#chat-continuity" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Chat Continuity</span>
									</a>
								</li>
															<li>
									<a href="#also-new" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Also new</span>
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
				
<p>VS Code moved to weekly stable releases. This changelog covers <a href="https://aka.ms/VSCode/Release">releases v1.116 through v1.119</a>, the releases we shipped throughout April and early May 2026.</p>
<p>Copilot can now search by meaning in any workspace and run grep-style queries across GitHub repos and orgs. An experimental <code>/chronicle</code> feature lets you query your own chat history to recall what you worked on, which files you touched, and which PRs you referenced. Smarter prompt caching, deferred tool loading, and purpose-built agentic tools reduce token usage without changing agent behavior.</p>
<p>Agents gain inline diffs in chat, browser tab sharing, and read/write access to any open terminal. Bring-your-own-key support extends to Copilot Business and Enterprise, letting teams connect their own model providers directly in VS Code. Admins get new group policies for controlling which domains agents can reach.</p>
<p>For longer-running work, Copilot CLI sessions can now be monitored and steered remotely from GitHub.com or the mobile app. Agent debug logs persist across sessions, and background terminal commands surface as notifications in chat.</p>
<h2 id="smarter-context"><a class="heading-link" href="#smarter-context">Smarter context<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<ul>
<li><strong>Search across any codebase</strong>: Semantic indexing now works in all workspaces. Agents can also run grep-style searches across GitHub repos and orgs with the new <code>githubTextSearch</code> tool.</li>
<li><strong>Query history with /chronicle (Experimental)</strong>: Chronicle tracks your chat interactions in a local database so you can search past sessions, recall recent work, and get personalized workflow tips. Setting: ⚙️ <code>github.copilot.chat.localIndex.enabled</code></li>
<li><strong>Lower token usage</strong>: Smarter prompt caching, deferred tool loading, and new agentic tools reduce token usage on every request.</li>
</ul>
<h2 id="agent-experience"><a class="heading-link" href="#agent-experience">Agent experience<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<ul>
<li><strong>Review diffs in chat</strong>: Code changes now appear as diffs directly in the chat thread.</li>
<li><strong>Generate agent customizations</strong>: Draft custom agents, skills, and instructions from a natural language description.</li>
<li><strong>Bring your own model key</strong>: Copilot Business and Enterprise users can link their own API keys (OpenRouter, Microsoft Foundry, Google, Anthropic, OpenAI, and others) to use those models directly in VS Code chat. You can also run models locally with Ollama, Foundry Local, and more. Admins control access via the Bring Your Own Language Model Key policy on GitHub.com. BYOK is available for Copilot Free, Pro, and Pro users.</li>
<li><strong>Agents can access any open terminal</strong>: Agents can read from and write to existing foreground terminals, including running REPLs and interactive scripts.</li>
<li><strong>Integrated Browser</strong>: Give agents visibility into your live browser by sharing tabs on demand as context. Agents can read content, interact with pages, and validate changes in real time.</li>
</ul>
<h2 id="chat-continuity"><a class="heading-link" href="#chat-continuity">Chat Continuity<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<ul>
<li><strong>Continue Copilot CLI sessions across devices</strong>: This experimental feature requires enabling ⚙️ <code>github.copilot.chat.cli.remote.enabled</code> in Settings. After that, run <code>/remote on</code> to monitor and steer ongoing Copilot CLI sessions started in VS Code from GitHub.com or the mobile app.</li>
<li><strong>Debug past agent sessions</strong>: The Agent Debug Log panel now persists logs locally so you can retrace what happened in earlier runs.</li>
<li><strong>Track background commands</strong>: Long-running terminal commands inform you of their status with system notifications in chat.</li>
</ul>
<h2 id="also-new"><a class="heading-link" href="#also-new">Also new<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<ul>
<li><strong>UX improvements to help you work more efficiently with agent sessions</strong>: Incremental chat rendering, sortable agent sessions, and synced session titles for Copilot CLI.</li>
<li><strong>New Markdown preview experience</strong>: Easily switch between Markdown source and preview using new toolbar buttons and commands.</li>
</ul>
<p>Happy coding!</p>
<p>Join the discussion within <a href="https://github.com/orgs/community/discussions/categories/announcements">GitHub Community</a>.</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#smarter-context" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Smarter context</span>
					</a>
				</li>
							<li>
					<a href="#agent-experience" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Agent experience</span>
					</a>
				</li>
							<li>
					<a href="#chat-continuity" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Chat Continuity</span>
					</a>
				</li>
							<li>
					<a href="#also-new" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Also new</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Smarter context</span></div>
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
									<a href="#smarter-context" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Smarter context</span>
									</a>
								</li>
															<li>
									<a href="#agent-experience" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Agent experience</span>
									</a>
								</li>
															<li>
									<a href="#chat-continuity" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Chat Continuity</span>
									</a>
								</li>
															<li>
									<a href="#also-new" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Also new</span>
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
