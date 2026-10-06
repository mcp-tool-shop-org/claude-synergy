---
product: github-copilot
version: "2026-10-01-github-copilot-in-vs-code-september-2026-releases"
released_at: "2026-10-01"
source_url: "https://github.blog/changelog/2026-10-01-github-copilot-in-vs-code-september-2026-releases"
fetched_at: "2026-10-06"
title: "GitHub Copilot in VS Code, September 2026 releases"
---

# github-copilot — GitHub Copilot in VS Code, September 2026 releases

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
	<time datetime="2026-10-01">
	October 1, 2026</time>			•
		2 minute read	</div>
		<h1 class="Heading--2">GitHub Copilot in VS Code, September 2026 releases</h1>
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
					<a href="#agents-window" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Agents window</span>
					</a>
				</li>
							<li>
					<a href="#workspaces-and-environments" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Workspaces and environments</span>
					</a>
				</li>
							<li>
					<a href="#chat-and-integrations" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Chat and integrations</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Agents window</span></div>
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
									<a href="#agents-window" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Agents window</span>
									</a>
								</li>
															<li>
									<a href="#workspaces-and-environments" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Workspaces and environments</span>
									</a>
								</li>
															<li>
									<a href="#chat-and-integrations" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Chat and integrations</span>
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
				
<p>This changelog covers VS Code <a href="https://aka.ms/VSCode/Release">v1.136 through v1.140</a>, shipped throughout September 2026.</p>
<p>September’s releases streamline agent-driven development from implementation through pull request merge. Automations handle repeatable tasks, agent merge helps land changes, and improved session management keeps work organized.</p>
<p>Agents are also more flexible across workspaces, Dev Containers, and apps, while GitHub context helps you collaborate without breaking your flow.</p>
<h2 id="agents-window"><a class="heading-link" href="#agents-window">Agents window<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Agents window updates made it easier to automate work, manage sessions, and move changes from implementation to merge.</p>
<ul>
<li><strong>Let HydraFusion coordinate models:</strong> If eligible, enable preview features and select HydraFusion in the model picker to choose models and workflows for your coding tasks automatically. This feature is in research preview.
</li>
<li>
<p><strong>Schedule recurring work:</strong> Use automations to run tasks on an hourly, daily, or weekly schedule or run them on demand. Start from a template or use your own prompt. This feature is in preview.</p>
</li>
<li>
<p><strong>Get pull requests ready to merge:</strong> Enable agent merge in an active session to let the agent handle review feedback, failed checks, merge conflicts, and workflow reruns. This feature is in preview.</p>
</li>
<li>
<p><strong>Create pull requests from agent sessions:</strong> Open the pull request form from a Copilot, Claude, or Codex agent session in the Agents window to review and edit the title and description, choose draft and merge options, and create the pull request.</p>
</li>
<li>
<p><strong>Navigate related chats and sessions:</strong> Agents can now decide to create new chats or sessions. Easily switch to the source chat with the navigation link, or use the sessions list to view all related chats organized in a hierarchical view.</p>
</li>
<li>
<p><strong>Keep completed sessions organized:</strong> Use <strong>Mark as Done</strong> suggestions after a session’s pull requests merge, or configure automatic cleanup to keep your session list manageable. This feature is in preview.</p>
</li>
<li>
<p><strong>See when sessions need attention:</strong> Enable the application badge to surface new results, input requests, and pull request checks on your dock, launcher, or taskbar. This feature is in preview.</p>
</li>
<li>
<p><strong>Start Dev Container sessions from the Agents window:</strong> Select <strong>Use Dev Container</strong> from a local or remote folder’s menu to run an agent session with your project’s configured tools and dependencies, including on SSH, Tunnel, and WSL hosts.</p>
</li>
</ul>
<p><video loop="" controls="" autoplay="" muted="" width="100%" src="https://github.com/user-attachments/assets/1eb0ee16-dadd-4a8d-977f-f04a31c01874"></video></p>
<h2 id="workspaces-and-environments"><a class="heading-link" href="#workspaces-and-environments">Workspaces and environments<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Workspace and environment updates make it easier to continue conversations with the project context agents need.</p>
<ul>
<li><strong>Continue quick chats in a workspace:</strong> Start a general Copilot chat without a workspace, then attach a local folder when you want to make the conversation specific to that project.
</li>
<li>
<p><strong>Continue Codex work across apps:</strong> Pick up a Codex conversation from the ChatGPT app in VS Code and start working on your codebase without copying and pasting context or files.</p>
</li>
</ul>
<p><video loop="" controls="" autoplay="" muted="" width="100%" src="https://github.com/user-attachments/assets/d7e09a40-73dd-46be-b1ee-d409431f304c"></video></p>
<h2 id="chat-and-integrations"><a class="heading-link" href="#chat-and-integrations">Chat and integrations<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Chat updates keep agent conversations flowing and make it easier to bring in GitHub context.</p>
<ul>
<li><strong>Keep active chats uninterrupted:</strong> When an agent sends a message to an ongoing chat, it no longer interrupts the active turn.
</li>
<li>
<p><strong>Attach GitHub context to any chat:</strong> Add a GitHub issue or pull request from <strong>Add Context</strong>, or paste its URL into the new-session input.</p>
</li>
</ul>
<p><video loop="" controls="" autoplay="" muted="" width="100%" src="https://github.com/user-attachments/assets/721c1d83-f862-4f40-99d4-d9d8f3a52a8d"></video></p>
<p>Browse the full release notes for <a href="https://aka.ms/VSCode/Release">VS Code 1.136, 1.137, 1.138, 1.139, and 1.140</a> to explore everything that’s new.</p>
<p>Download the latest version of <a href="https://code.visualstudio.com">VS Code</a> and, as always, happy coding!</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#agents-window" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Agents window</span>
					</a>
				</li>
							<li>
					<a href="#workspaces-and-environments" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Workspaces and environments</span>
					</a>
				</li>
							<li>
					<a href="#chat-and-integrations" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Chat and integrations</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Agents window</span></div>
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
									<a href="#agents-window" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Agents window</span>
									</a>
								</li>
															<li>
									<a href="#workspaces-and-environments" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Workspaces and environments</span>
									</a>
								</li>
															<li>
									<a href="#chat-and-integrations" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Chat and integrations</span>
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
