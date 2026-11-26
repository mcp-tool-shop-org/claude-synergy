---
product: github-copilot
version: "2026-11-17-copilot-code-review-adaptive-effort-secret-detection-and-more"
released_at: "2026-11-17"
source_url: "https://github.blog/changelog/2026-11-17-copilot-code-review-adaptive-effort-secret-detection-and-more"
fetched_at: "2026-11-26"
title: "Copilot code review: Adaptive effort, secret detection, and more"
---

# github-copilot — Copilot code review: Adaptive effort, secret detection, and more

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
	<time datetime="2026-11-17">
	November 17, 2026</time>			•
		3 minute read	</div>
		<h1 class="Heading--2">Copilot code review: Adaptive effort, secret detection, and more</h1>
	</div>
	
	<div class="ChangelogFeaturedImage">
					<svg aria-hidden="true" width="2064" height="940" role="presentation"></svg>
			<img width="2064" height="940" src="https://github.blog/wp-content/uploads/2026/11/708276060-898ea15e-8683-4b21-9f2a-1eafc4054ed9.png?resize=2064%2C940" class="CoverImage wp-post-image" alt="Copilot code review flagging a possible secret in a pull request, with the reviewer menu open to the Adaptive effort level" decoding="async" fetchpriority="high" sizes="(max-width: 2064px) 100vw, 2064px">				
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
					<a href="#%f0%9f%8e%af-adaptive-the-right-review-effort-for-each-pull-request" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>🎯 Adaptive: The right review effort for each pull request</span>
					</a>
				</li>
							<li>
					<a href="#%f0%9f%94%97-cross-repository-context" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>🔗 Cross-repository context</span>
					</a>
				</li>
							<li>
					<a href="#%f0%9f%94%90-secret-detection-in-reviews" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>🔐 Secret detection in reviews</span>
					</a>
				</li>
							<li>
					<a href="#%f0%9f%93%8a-track-review-outcomes-by-repository" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>📊 Track review outcomes by repository</span>
					</a>
				</li>
							<li>
					<a href="#%e2%98%81%ef%b8%8f-copilot-code-review-for-azure-devops" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>☁️ Copilot code review for Azure DevOps</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">🎯 Adaptive: The right review effort for each pull request</span></div>
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
									<a href="#%f0%9f%8e%af-adaptive-the-right-review-effort-for-each-pull-request" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>🎯 Adaptive: The right review effort for each pull request</span>
									</a>
								</li>
															<li>
									<a href="#%f0%9f%94%97-cross-repository-context" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>🔗 Cross-repository context</span>
									</a>
								</li>
															<li>
									<a href="#%f0%9f%94%90-secret-detection-in-reviews" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>🔐 Secret detection in reviews</span>
									</a>
								</li>
															<li>
									<a href="#%f0%9f%93%8a-track-review-outcomes-by-repository" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>📊 Track review outcomes by repository</span>
									</a>
								</li>
															<li>
									<a href="#%e2%98%81%ef%b8%8f-copilot-code-review-for-azure-devops" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>☁️ Copilot code review for Azure DevOps</span>
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
				
<p>GitHub Copilot code review now helps you catch more issues earlier, with less effort. <strong>Adaptive</strong> matches review depth to each pull request, so routine changes get a quick pass and risky changes get a deeper look. Reviews can also draw on related repositories and flag exposed secrets before they reach your main branch. Features in public preview are subject to change.</p>
<p>Adaptive, cross-repository context, and secret detection are available to Copilot Pro, Pro+, Max, Business, and Enterprise plans.</p>
<h2 id="%f0%9f%8e%af-adaptive-the-right-review-effort-for-each-pull-request"><a class="heading-link" href="#%f0%9f%8e%af-adaptive-the-right-review-effort-for-each-pull-request">🎯 Adaptive: The right review effort for each pull request<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Today, someone has to decide in settings or when requesting a review, what review effort level each pull request needs. A documentation update may only need <strong>Lite</strong>, while a change to authentication logic benefits from <strong>Max</strong>. <strong>Adaptive</strong> makes that choice for you. Copilot looks at each pull request’s complexity and risk, then reviews it with <strong>Lite</strong>, <strong>Balanced</strong>, or <strong>Max</strong>. Each review shows which effort level Adaptive picked. Adaptive is now in public preview.</p>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/80e6deff-9b4b-42e4-ae51-07095bba35a1" alt="Screenshot of the Reviewers bar on a pull request with the review effort menu open and Adaptive selected"></p>
<h3 id="%e2%9a%99%ef%b8%8f-configure-adaptive"><a class="heading-link" href="#%e2%9a%99%ef%b8%8f-configure-adaptive">⚙️ Configure Adaptive<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>You can select <strong>Adaptive</strong> for a single pull request from the “Reviewers” bar, or set it as your default review effort in personal, repository, organization, or enterprise settings. <strong>Balanced</strong> remains the default review effort level.</p>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/40dab985-dca3-40ba-9b72-2e41843db751" alt="Screenshot of Copilot code review settings with the default review effort level menu open and Adaptive selected"></p>
<p>Adaptive never picks a level above the maximum review effort level set for your enterprise, organization, or repository. To learn more, see <a href="https://docs.github.com/copilot/how-tos/copilot-on-github/set-up-copilot/configure-code-review?utm_source=ccr-changelog-adaptive-review-docs&amp;utm_medium=changelog&amp;utm_campaign=ignite-nov-2026">Configuring code review by GitHub Copilot</a>.</p>
<p>⚠️ The maximum review effort level configured in Copilot code review settings determines which levels Adaptive can choose from.</p>
<h2 id="%f0%9f%94%97-cross-repository-context"><a class="heading-link" href="#%f0%9f%94%97-cross-repository-context">🔗 Cross-repository context<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Changes often affect code outside the repository you’re working in. With cross-repository context, Copilot code review can read related public repositories during a review, so it can find code in other repositories that depends on your change. It can also find relevant context from documentation stored in other repositories, custom instructions and skills, and more.</p>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/c385f9b0-1eb3-4d48-8324-b4372cd96bce" alt="Screenshot of a Copilot code review comment that flags a call using an outdated function signature from another repository"></p>
<p>Cross-repository context is now in public preview for public repositories.</p>
<h2 id="%f0%9f%94%90-secret-detection-in-reviews"><a class="heading-link" href="#%f0%9f%94%90-secret-detection-in-reviews">🔐 Secret detection in reviews<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Copilot code review can now flag exposed secrets in your pull requests. Using both deterministic and non-deterministic approaches, Copilot code review points out exposed credentials in review comments, so you can remove them before you merge. Secret detection in Copilot code review is now in public preview.</p>
<p>Secret detection is supported for the following types:</p>
<ul>
<li><strong>Known formats.</strong> GitHub collaborates with 150+ technical partners through GitHub’s <a href="https://docs.github.com/code-security/tutorials/secret-scanning-partner-program?utm_source=ccr-changelog-secret-scanning-partner-program-docs&amp;utm_medium=changelog&amp;utm_campaign=ignite-nov-2026">secret scanning partnership program</a> in order to build out high-confidence secret detectors. These 500+ secret types use deterministic methods like regex to find secrets.</li>
<li><strong>AI/ML-detected secrets.</strong> Copilot code review also detects secrets without recognizable format. It uses LLMs and GitHub’s purpose-built model for secret to find exposed secrets.</li>
</ul>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/5a71d349-49ce-4fef-ade2-c04e7e5c3ddc" alt="Screenshot of a Copilot code review comment that flags a possible secret in a changed line"></p>
<p>To turn on secret detection, go to your repository or organization settings and select <strong>Copilot</strong>, then <strong>Code review</strong>. To learn more, see <a href="https://docs.github.com/code-security/concepts/secret-security/secret-scanning?utm_source=ccr-changelog-secret-scanning-docs&amp;utm_medium=changelog&amp;utm_campaign=ignite-nov-2026">Secret scanning</a>.</p>
<h2 id="%f0%9f%93%8a-track-review-outcomes-by-repository"><a class="heading-link" href="#%f0%9f%93%8a-track-review-outcomes-by-repository">📊 Track review outcomes by repository<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>You can now see how Copilot code review feedback is addressed and utilized in each repository. To get started, navigate to the <strong>Insights</strong> tab of any repository you have read access to, then click <strong>Repository insights</strong>. For details, see <a href="https://github.blog/changelog/2026-11-17-track-copilot-code-review-outcomes-in-repository-insights?utm_source=ccr-changelog-ccr-review-outcomes-changelog&amp;utm_medium=changelog&amp;utm_campaign=ignite-nov-2026">Track Copilot code review outcomes by repository with Repo Insights</a>.</p>
<h2 id="%e2%98%81%ef%b8%8f-copilot-code-review-for-azure-devops"><a class="heading-link" href="#%e2%98%81%ef%b8%8f-copilot-code-review-for-azure-devops">☁️ Copilot code review for Azure DevOps<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Copilot code review for Azure Repos, previously in public preview, is now generally available. Teams that host code in Azure DevOps can get Copilot reviews on their pull requests, with comments and suggested changes on the lines that need attention.</p>
<ul>
<li><strong>Flexible setup:</strong> Administrators turn on Copilot code review at the organization, project, and repository level. Add a branch policy to request a Copilot review automatically on pull requests that target a branch, or request one manually from the <strong>Reviewers</strong> list.</li>
<li><strong>Review effort levels:</strong> Set a default of <strong>Lite</strong> or <strong>Balanced</strong> for a project or repository, or choose a different effort level for a single review.</li>
<li><strong>Custom instructions and skills:</strong> Tailor Copilot’s feedback to your team’s standards with custom instructions and agent skills.</li>
<li><strong>Faster follow-up:</strong> Apply and commit Copilot’s suggestions and resolve the related comments at the same time.</li>
<li><strong>Admin visibility:</strong> Audit log events record when Copilot code review is turned on or off and when its settings change.</li>
<li><strong>Azure billing:</strong> Usage is billed in GitHub AI credits to the Azure subscription linked to your Azure DevOps organization, so you can track costs and set budget alerts in Azure Cost Management.</li>
</ul>
<p>To get started, see <a href="https://learn.microsoft.com/azure/devops/repos/git/copilot-code-reviews">Get started with Copilot code review for pull requests</a> in the Azure DevOps documentation.</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#%f0%9f%8e%af-adaptive-the-right-review-effort-for-each-pull-request" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>🎯 Adaptive: The right review effort for each pull request</span>
					</a>
				</li>
							<li>
					<a href="#%f0%9f%94%97-cross-repository-context" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>🔗 Cross-repository context</span>
					</a>
				</li>
							<li>
					<a href="#%f0%9f%94%90-secret-detection-in-reviews" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>🔐 Secret detection in reviews</span>
					</a>
				</li>
							<li>
					<a href="#%f0%9f%93%8a-track-review-outcomes-by-repository" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>📊 Track review outcomes by repository</span>
					</a>
				</li>
							<li>
					<a href="#%e2%98%81%ef%b8%8f-copilot-code-review-for-azure-devops" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>☁️ Copilot code review for Azure DevOps</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">🎯 Adaptive: The right review effort for each pull request</span></div>
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
									<a href="#%f0%9f%8e%af-adaptive-the-right-review-effort-for-each-pull-request" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>🎯 Adaptive: The right review effort for each pull request</span>
									</a>
								</li>
															<li>
									<a href="#%f0%9f%94%97-cross-repository-context" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>🔗 Cross-repository context</span>
									</a>
								</li>
															<li>
									<a href="#%f0%9f%94%90-secret-detection-in-reviews" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>🔐 Secret detection in reviews</span>
									</a>
								</li>
															<li>
									<a href="#%f0%9f%93%8a-track-review-outcomes-by-repository" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>📊 Track review outcomes by repository</span>
									</a>
								</li>
															<li>
									<a href="#%e2%98%81%ef%b8%8f-copilot-code-review-for-azure-devops" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>☁️ Copilot code review for Azure DevOps</span>
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
