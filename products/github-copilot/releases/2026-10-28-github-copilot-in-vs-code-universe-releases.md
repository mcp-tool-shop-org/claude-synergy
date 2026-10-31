---
product: github-copilot
version: "2026-10-28-github-copilot-in-vs-code-universe-releases"
released_at: "2026-10-28"
source_url: "https://github.blog/changelog/2026-10-28-github-copilot-in-vs-code-universe-releases"
fetched_at: "2026-10-31"
title: "GitHub Copilot in VS Code, Universe releases"
---

# github-copilot — GitHub Copilot in VS Code, Universe releases

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
	<time datetime="2026-10-28">
	October 28, 2026</time>			•
		4 minute read	</div>
		<h1 class="Heading--2">GitHub Copilot in VS Code, Universe releases</h1>
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
					<a href="#start-and-follow-cloud-sessions-across-copilot-clients" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Start and follow cloud sessions across Copilot clients</span>
					</a>
				</li>
							<li>
					<a href="#keep-agents-working-on-your-own-machines" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Keep agents working on your own machines</span>
					</a>
				</li>
							<li>
					<a href="#move-between-the-editor-and-agents-windows" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Move between the editor and Agents windows</span>
					</a>
				</li>
							<li>
					<a href="#control-agents-on-your-machine-from-your-phone" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Control agents on your machine from your phone</span>
					</a>
				</li>
							<li>
					<a href="#get-a-more-consistent-github-copilot" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Get a more consistent GitHub Copilot</span>
					</a>
				</li>
							<li>
					<a href="#install-github-copilot-cli-with-vs-code" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Install GitHub Copilot CLI with VS Code</span>
					</a>
				</li>
							<li>
					<a href="#compare-model-results" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Compare model results</span>
					</a>
				</li>
							<li>
					<a href="#let-your-agent-use-your-desktop-apps" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Let your agent use your desktop apps</span>
					</a>
				</li>
							<li>
					<a href="#build-your-own-client" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Build your own client</span>
					</a>
				</li>
							<li>
					<a href="#discover-marketplace-customizations" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Discover marketplace customizations</span>
					</a>
				</li>
							<li>
					<a href="#strengthen-existing-plugin-and-marketplace-controls" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Strengthen existing plugin and marketplace controls</span>
					</a>
				</li>
							<li>
					<a href="#connect-services-with-copilot-connectors" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Connect services with Copilot connectors</span>
					</a>
				</li>
							<li>
					<a href="#learn-more" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Learn more</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Start and follow cloud sessions across Copilot clients</span></div>
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
									<a href="#start-and-follow-cloud-sessions-across-copilot-clients" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Start and follow cloud sessions across Copilot clients</span>
									</a>
								</li>
															<li>
									<a href="#keep-agents-working-on-your-own-machines" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Keep agents working on your own machines</span>
									</a>
								</li>
															<li>
									<a href="#move-between-the-editor-and-agents-windows" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Move between the editor and Agents windows</span>
									</a>
								</li>
															<li>
									<a href="#control-agents-on-your-machine-from-your-phone" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Control agents on your machine from your phone</span>
									</a>
								</li>
															<li>
									<a href="#get-a-more-consistent-github-copilot" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Get a more consistent GitHub Copilot</span>
									</a>
								</li>
															<li>
									<a href="#install-github-copilot-cli-with-vs-code" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Install GitHub Copilot CLI with VS Code</span>
									</a>
								</li>
															<li>
									<a href="#compare-model-results" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Compare model results</span>
									</a>
								</li>
															<li>
									<a href="#let-your-agent-use-your-desktop-apps" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Let your agent use your desktop apps</span>
									</a>
								</li>
															<li>
									<a href="#build-your-own-client" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Build your own client</span>
									</a>
								</li>
															<li>
									<a href="#discover-marketplace-customizations" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Discover marketplace customizations</span>
									</a>
								</li>
															<li>
									<a href="#strengthen-existing-plugin-and-marketplace-controls" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Strengthen existing plugin and marketplace controls</span>
									</a>
								</li>
															<li>
									<a href="#connect-services-with-copilot-connectors" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Connect services with Copilot connectors</span>
									</a>
								</li>
															<li>
									<a href="#learn-more" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Learn more</span>
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
				
<p>This year, we focused on giving you more choice in how you work with GitHub Copilot in Visual Studio Code: which models you use, where your agents run, and how you stay involved.</p>
<p>Keep work moving without staying at your desk or in one tool. With GitHub Copilot in Visual Studio Code, start a cloud agent session from your phone at standup, steer it from VS Code at your desk, and check on it from github.com at lunch. Session continuity lets you pick up the same session across these clients while your agent keeps working in the cloud.</p>
<h3 id="start-and-follow-cloud-sessions-across-copilot-clients"><a class="heading-link" href="#start-and-follow-cloud-sessions-across-copilot-clients">Start and follow cloud sessions across Copilot clients<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Hand off work without keeping your computer on. Start a cloud agent session from the Agents window in VS Code. The work runs on GitHub’s infrastructure, so closing your laptop doesn’t stop it.</p>
<p>Find and continue the same session in VS Code, the GitHub Copilot app, GitHub Mobile, github.com, or Copilot CLI. Sessions started in a Slack or Microsoft Teams DM can also be continued in these clients.</p>
<p><video loop="" controls="" autoplay="" muted="" width="100%" src="https://github.com/user-attachments/assets/b17fc155-f9a6-468f-b00b-97845acaac95"><br>
</video></p>
<h3 id="keep-agents-working-on-your-own-machines"><a class="heading-link" href="#keep-agents-working-on-your-own-machines">Keep agents working on your own machines<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Move on to another task or project without worrying about losing your session. The new <a href="https://code.visualstudio.com/docs/agents/concepts/agent-host">Agent Host</a> isolates your Copilot sessions from individual VS Code windows, so work continues in the background after you close the project folder or window.</p>
<p>You can also run agents on a separate machine while you use your primary development machine for other work. The power and flexibility of VS Code’s Remote SSH and dev tunnels extends to the Agents window. The remote agent works with the same code, tools, and dependencies, and can keep running when you disconnect or quit VS Code locally. The remote machine and its Agent Host must remain running.</p>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/20f5756c-3edf-472a-85ba-0a0e4083985b" alt="Screenshot of VS Code showing a drop-down menu with the Remote option expanded, displaying Tunnels and SSH."></p>
<h3 id="move-between-the-editor-and-agents-windows"><a class="heading-link" href="#move-between-the-editor-and-agents-windows">Move between the editor and Agents windows<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Switch between the editor and the Agents window without starting over. Both views stay in sync with the same live Copilot session.</p>
<p><video loop="" controls="" autoplay="" muted="" width="100%" src="https://github.com/user-attachments/assets/e2f34e59-a797-41c1-a319-a49d127ff241"><br>
</video></p>
<h3 id="control-agents-on-your-machine-from-your-phone"><a class="heading-link" href="#control-agents-on-your-machine-from-your-phone">Control agents on your machine from your phone<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Check progress, give direction, or start a new task on your development machine from GitHub Mobile. Your phone provides the controls, and the agent does the work on your development machine. To get started, open a terminal on that machine and run the VS Code CLI command <code>code agent host --github-environment</code> from your project folder. Keep the machine and its Agent Host running while you use it from your phone.</p>
<p><video loop="" controls="" autoplay="" muted="" width="100%" src="https://github.com/user-attachments/assets/c1743f1b-3fb3-47aa-99ad-0d53a9733a09"><br>
</video></p>
<h3 id="get-a-more-consistent-github-copilot"><a class="heading-link" href="#get-a-more-consistent-github-copilot">Get a more consistent GitHub Copilot<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Get more consistent agent behavior across VS Code, Copilot CLI, and the GitHub Copilot app. The Copilot harness, built on the Microsoft Copilot SDK, is now the default for new sessions in both the editor and the Agents window.</p>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/5aac81b9-be0f-4e6e-8c77-c4a097e294f3" alt="Screenshot showing Copilot selected in the harness picker with a hover description of its Copilot SDK and Agent Host integration."></p>
<h3 id="install-github-copilot-cli-with-vs-code"><a class="heading-link" href="#install-github-copilot-cli-with-vs-code">Install GitHub Copilot CLI with VS Code<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Bring Copilot to your terminal with less setup. Install GitHub Copilot CLI through the VS Code installer on Windows, when adding VS Code to your path on macOS, or by running <code>copilot</code> on Linux.</p>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/880bfc64-8225-41b3-a908-653078039ef5" alt="VS Code Insiders Windows installer setup window, with the Install GitHub Copilot CLI option checked."></p>
<h3 id="compare-model-results"><a class="heading-link" href="#compare-model-results">Compare model results<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Explore different approaches to the same coding task. Run models and harnesses in parallel in the Agents window, then review their results side by side. You can ask a Judge model to recommend a solution and choose <strong>Synthesize</strong> to combine ideas from the other attempts. This is in preview.</p>
<p><video loop="" controls="" autoplay="" muted="" width="100%" src="https://github.com/user-attachments/assets/79c63fbb-e233-4c3f-9edb-3e57f7cff63e"><br>
</video></p>
<h3 id="let-your-agent-use-your-desktop-apps"><a class="heading-link" href="#let-your-agent-use-your-desktop-apps">Let your agent use your desktop apps<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Give your agent tasks that need more than code or terminal commands. With computer use, Copilot can read and interact with desktop apps, including clicking controls and editing text.</p>
<p>On macOS or Windows, open <a href="https://code.visualstudio.com/docs/configure/settings#_settings-editor">VS Code Settings</a>, search for <code>chat.agentHost.computerUse.enabled</code>, and enable it. Restart VS Code, then run <code>/computer on</code> in a Copilot session running on your computer.</p>
<p>Each application requires your approval. Computer use shares its setup with Copilot CLI and the GitHub Copilot app, so on macOS you grant the required system permissions once. Organizations can disable computer use through policy.</p>
<p>This is an experimental feature.</p>
<p><video loop="" controls="" autoplay="" muted="" width="100%" src="https://github.com/user-attachments/assets/c830395d-6e2b-4554-90ce-f40ae6067857"><br>
</video></p>
<h3 id="build-your-own-client"><a class="heading-link" href="#build-your-own-client">Build your own client<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Bring session continuity to your own app. Build a client that connects to an Agent Host and works with the same live sessions as VS Code.</p>
<p>The open <a href="https://microsoft.github.io/agent-host-protocol/">Agent Host Protocol (AHP)</a> lets connected clients stay in sync and catch up after reconnecting. Run <code>code agent host</code>, then connect with a client library for TypeScript, Rust, Go, Kotlin, or Swift.</p>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/f839f535-231e-48f0-aa4d-80504aeaa57b" alt="Animated diagram showing VS Code and a custom app connected to the same Agent Host through the Agent Host Protocol (AHP), sharing live sessions. When the app reconnects, it catches up on missed updates."></p>
<h3 id="discover-marketplace-customizations"><a class="heading-link" href="#discover-marketplace-customizations">Discover marketplace customizations<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Create, discover, and manage agent customizations from one place in VS Code. Open <strong>Customizations</strong> in the Agents window sidebar or run <strong>Chat: Open Customizations</strong>. Its “Browse” page brings together skills, MCP servers, plugins, and other customizations from available sources.</p>
<p>The Customization Marketplace is in preview and enabled by default. Business and Enterprise administrators need to allow <strong>Editor preview features</strong>. Learn more about the <a href="https://code.visualstudio.com/docs/agent-customization/overview">Agent Customizations editor and marketplace</a>.</p>
<h3 id="strengthen-existing-plugin-and-marketplace-controls"><a class="heading-link" href="#strengthen-existing-plugin-and-marketplace-controls">Strengthen existing plugin and marketplace controls<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Make existing plugin and marketplace controls more reliable. In VS Code, administrators can use policies to require or block named plugins, add marketplaces, and restrict installation to approved sources. Enterprise-managed strict marketplace settings can also turn off built-in marketplaces. Policy-managed plugin toggles are locked in <strong>Customize</strong> &gt; <strong>Plugins</strong>. For controls across Copilot clients, administrators can use <a href="https://docs.github.com/copilot/reference/enterprise-administrators/enterprise-managed-settings?utm_source=vscode-changelog-enterprise-settings-docs&amp;utm_medium=changelog&amp;utm_campaign=universe-2026">enterprise-managed settings</a>.</p>
<p>At the repository level, <code>.github/copilot/settings.json</code> can register plugin marketplaces and enable default plugins. These are defaults, not enforcement: contributors can turn plugins off unless enterprise policy requires them. Learn more about <a href="https://code.visualstudio.com/docs/agent-customization/agent-plugins">plugin marketplaces and workspace recommendations</a>.</p>
<h3 id="connect-services-with-copilot-connectors"><a class="heading-link" href="#connect-services-with-copilot-connectors">Connect services with Copilot connectors<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Bring context from services such as Slack, Notion, and Microsoft Learn into agent sessions without installing or managing an MCP server. Connect once from “Browse” and reuse the connection across supported Copilot clients signed in with the same account.</p>
<p>Connectors are in preview, available on all Copilot plans, and work with the Copilot harness. Business and Enterprise administrators need to allow <strong>Editor preview features</strong>. Learn more about <a href="https://code.visualstudio.com/docs/agent-customization/copilot-connectors">Copilot connectors in VS Code</a>.</p>
<h3 id="learn-more"><a class="heading-link" href="#learn-more">Learn more<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Learn more in the <a href="https://code.visualstudio.com/updates/v1_144">VS Code release notes</a>, the <a href="https://code.visualstudio.com/blogs/2026/08/26/agent-host-architecture">Agent Host deep dive</a>, and <a href="https://docs.github.com/copilot/concepts/agents/computer-use?utm_source=vscode-changelog-computer-use-docs&amp;utm_medium=changelog&amp;utm_campaign=universe-2026">About computer use in GitHub Copilot</a>.</p>
<p>Happy coding! 💙</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#start-and-follow-cloud-sessions-across-copilot-clients" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Start and follow cloud sessions across Copilot clients</span>
					</a>
				</li>
							<li>
					<a href="#keep-agents-working-on-your-own-machines" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Keep agents working on your own machines</span>
					</a>
				</li>
							<li>
					<a href="#move-between-the-editor-and-agents-windows" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Move between the editor and Agents windows</span>
					</a>
				</li>
							<li>
					<a href="#control-agents-on-your-machine-from-your-phone" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Control agents on your machine from your phone</span>
					</a>
				</li>
							<li>
					<a href="#get-a-more-consistent-github-copilot" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Get a more consistent GitHub Copilot</span>
					</a>
				</li>
							<li>
					<a href="#install-github-copilot-cli-with-vs-code" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Install GitHub Copilot CLI with VS Code</span>
					</a>
				</li>
							<li>
					<a href="#compare-model-results" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Compare model results</span>
					</a>
				</li>
							<li>
					<a href="#let-your-agent-use-your-desktop-apps" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Let your agent use your desktop apps</span>
					</a>
				</li>
							<li>
					<a href="#build-your-own-client" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Build your own client</span>
					</a>
				</li>
							<li>
					<a href="#discover-marketplace-customizations" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Discover marketplace customizations</span>
					</a>
				</li>
							<li>
					<a href="#strengthen-existing-plugin-and-marketplace-controls" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Strengthen existing plugin and marketplace controls</span>
					</a>
				</li>
							<li>
					<a href="#connect-services-with-copilot-connectors" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Connect services with Copilot connectors</span>
					</a>
				</li>
							<li>
					<a href="#learn-more" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Learn more</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Start and follow cloud sessions across Copilot clients</span></div>
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
									<a href="#start-and-follow-cloud-sessions-across-copilot-clients" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Start and follow cloud sessions across Copilot clients</span>
									</a>
								</li>
															<li>
									<a href="#keep-agents-working-on-your-own-machines" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Keep agents working on your own machines</span>
									</a>
								</li>
															<li>
									<a href="#move-between-the-editor-and-agents-windows" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Move between the editor and Agents windows</span>
									</a>
								</li>
															<li>
									<a href="#control-agents-on-your-machine-from-your-phone" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Control agents on your machine from your phone</span>
									</a>
								</li>
															<li>
									<a href="#get-a-more-consistent-github-copilot" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Get a more consistent GitHub Copilot</span>
									</a>
								</li>
															<li>
									<a href="#install-github-copilot-cli-with-vs-code" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Install GitHub Copilot CLI with VS Code</span>
									</a>
								</li>
															<li>
									<a href="#compare-model-results" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Compare model results</span>
									</a>
								</li>
															<li>
									<a href="#let-your-agent-use-your-desktop-apps" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Let your agent use your desktop apps</span>
									</a>
								</li>
															<li>
									<a href="#build-your-own-client" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Build your own client</span>
									</a>
								</li>
															<li>
									<a href="#discover-marketplace-customizations" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Discover marketplace customizations</span>
									</a>
								</li>
															<li>
									<a href="#strengthen-existing-plugin-and-marketplace-controls" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Strengthen existing plugin and marketplace controls</span>
									</a>
								</li>
															<li>
									<a href="#connect-services-with-copilot-connectors" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Connect services with Copilot connectors</span>
									</a>
								</li>
															<li>
									<a href="#learn-more" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Learn more</span>
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
			<a href="https://github.blog/changelog/2026/?label=universe26" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: universe26; ref_location:post footer;">universe26</a>
			<a href="https://github.blog/changelog/2026/?label=vs-code" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: vs code; ref_location:post footer;">vs code</a>
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
