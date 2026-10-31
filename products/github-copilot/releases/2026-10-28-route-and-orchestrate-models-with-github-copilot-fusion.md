---
product: github-copilot
version: "2026-10-28-route-and-orchestrate-models-with-github-copilot-fusion"
released_at: "2026-10-28"
source_url: "https://github.blog/changelog/2026-10-28-route-and-orchestrate-models-with-github-copilot-fusion"
fetched_at: "2026-10-31"
title: "Route and orchestrate models with GitHub Copilot Fusion"
---

# github-copilot — Route and orchestrate models with GitHub Copilot Fusion

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
		2 minute read	</div>
		<h1 class="Heading--2">Route and orchestrate models with GitHub Copilot Fusion</h1>
	</div>
	
	<div class="ChangelogFeaturedImage">
					<svg aria-hidden="true" width="2064" height="1056" role="presentation"></svg>
			<img width="2064" height="1056" src="https://github.blog/wp-content/uploads/2026/11/683297831-90d4b889-b7d4-4473-93fc-e75bb8595652.png?resize=2064%2C1056" class="CoverImage wp-post-image" alt="A GitHub Copilot prompt composer with the Copilot Fusion settings menu open. Fusion is enabled, and the effort-level options are Standard, High, and Max; Max is selected." decoding="async" fetchpriority="high" srcset="https://github.blog/wp-content/uploads/2026/11/683297831-90d4b889-b7d4-4473-93fc-e75bb8595652.png?w=2064 2064w, https://github.blog/wp-content/uploads/2026/11/683297831-90d4b889-b7d4-4473-93fc-e75bb8595652.png?w=300 300w, https://github.blog/wp-content/uploads/2026/11/683297831-90d4b889-b7d4-4473-93fc-e75bb8595652.png?w=768 768w, https://github.blog/wp-content/uploads/2026/11/683297831-90d4b889-b7d4-4473-93fc-e75bb8595652.png?w=1024 1024w, https://github.blog/wp-content/uploads/2026/11/683297831-90d4b889-b7d4-4473-93fc-e75bb8595652.png?w=1536 1536w, https://github.blog/wp-content/uploads/2026/11/683297831-90d4b889-b7d4-4473-93fc-e75bb8595652.png?w=2048 2048w" sizes="(max-width: 2064px) 100vw, 2064px">				
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
					<a href="#smarter-choices-for-developers" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Smarter choices for developers</span>
					</a>
				</li>
							<li>
					<a href="#more-control-for-administrators" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>More control for administrators</span>
					</a>
				</li>
							<li>
					<a href="#billing" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Billing</span>
					</a>
				</li>
							<li>
					<a href="#get-started" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Get started</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Smarter choices for developers</span></div>
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
									<a href="#smarter-choices-for-developers" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Smarter choices for developers</span>
									</a>
								</li>
															<li>
									<a href="#more-control-for-administrators" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>More control for administrators</span>
									</a>
								</li>
															<li>
									<a href="#billing" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Billing</span>
									</a>
								</li>
															<li>
									<a href="#get-started" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Get started</span>
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
				
<p>GitHub Copilot Fusion is generally available. Instead of picking a model for each task, choose Copilot Fusion and let Copilot intelligently route and orchestrate which models it uses for you.</p>
<p>Copilot Fusion brings together <a href="https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/">Project HydraFusion’s</a> multi-model orchestration and <a href="https://docs.github.com/copilot/concepts/models/auto-model-selection">Copilot auto model selection’s</a> fine-tuned model selection, leveraging the benefits of both to balance performance and cost efficiency.</p>
<p>Since Project HydraFusion launched, we’ve improved its performance. In the Artificial Analysis Coding Agent Index, Copilot Fusion Max scored 60, within two points of Claude Code with Opus 5.5 Max. It delivered that result at about half the average API cost per task, using about half as many tokens and taking about 40% less time per task.</p>
<h2 id="smarter-choices-for-developers"><a class="heading-link" href="#smarter-choices-for-developers">Smarter choices for developers<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>When you select Copilot Fusion in the model picker, you aren’t selecting a specific model. You’re choosing a system that routes and orchestrates models for each task. There’s no need to switch models during a task or decide which model suits each step. For each prompt, Copilot Fusion determines which models to use and how they work together, while you choose the right level of effort.</p>
<p>To use it, select <strong>Copilot Fusion</strong> in the model picker, then choose the effort level.</p>
<ul>
<li><strong>Fusion Standard:</strong> Prioritizes versatile models for everyday coding.</li>
<li><strong>Fusion High:</strong> Prioritizes capable models for challenging tasks and deeper reasoning. </li>
<li><strong>Fusion Max:</strong> Prioritizes the most capable models for the most demanding tasks and complex reasoning.</li>
</ul>
<p>Watch as Copilot Fusion analyzes each task and selects a model to complete it, orchestrating multiple models through the following workflows when needed.</p>
<ul>
<li><strong>Single:</strong> One model solves the task directly.  </li>
<li><strong>Cascade:</strong> An efficient model drafts a response. A quality check determines whether to accept it or escalate to a stronger model. </li>
<li><strong>Critique:</strong> One model drafts an initial response, another model reviews it, and the original model revises.</li>
</ul>
<p><img decoding="async" loading="lazy" src="https://github.com/user-attachments/assets/1eeffdb5-0c21-4697-8007-bb6df0e70e8b" alt="Diagram titled 'Three execution patterns in Copilot Fusion,' comparing three workflows: Single, where a a primary model uses tools to request an answer; Cascade, where a primary model makes a first pass before a judge model either accepts its result as the answer or escalates to a repair model for a fresh-start answer; and Critique, where a primary model drafts an answer and a read-only critic either approves it as-is or requests a revision by the primary model."></p>
<h2 id="more-control-for-administrators"><a class="heading-link" href="#more-control-for-administrators">More control for administrators<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Administrators control which models Copilot Fusion can use and whether Copilot Fusion is the default.</p>
<ul>
<li>Copilot Fusion only uses the models that are enabled in your enterprise and organization <strong>model policies</strong>. Enterprise administrators can view what models Copilot Fusion picks from, independently set each model’s effective policy state, and disable models for Copilot Fusion without disabling the model for everyone. See <a href="https://docs.github.com/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-availability-of-default-models#configuring-models-available-for-copilot-fusion">Manage availability of default models</a>.</li>
<li>Administrators can set Copilot Fusion, at any effort level, as the <strong>default model</strong> for Copilot users with Enterprise managed settings. To configure settings, see <a href="https://docs.github.com/copilot/reference/enterprise-administrators/enterprise-managed-settings#fusiontier">Enterprise managed settings</a>.</li>
</ul>
<blockquote class="gh-changelog-quote"><p>“GitHub Copilot Fusion Standard has improved token efficiency across AT&amp;T by automatically selecting the right model for the task, reducing unnecessary spend and preserving capacity for higher-value work. Previously, developers would often choose a more powerful model for a complex task and forget to switch back for everyday activities. Copilot Fusion eliminates that friction, optimizing model selection without requiring developers to manage it themselves. We’ve also seen its decision-making improve over time, giving developers greater confidence to focus on their work while Copilot handles model selection.”<br>
<cite>Hari Pokhrel, Principal Software Engineer, AT&amp;T</cite></p></blockquote>
<h2 id="billing"><a class="heading-link" href="#billing">Billing<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>When you use Copilot Fusion you’re billed for each model it uses, at each model’s standard rate. For a limited time, users on paid Copilot plans will receive a 30% discount on model costs when using Copilot Fusion.</p>
<h2 id="get-started"><a class="heading-link" href="#get-started">Get started<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h2>
<p>Copilot Fusion is available on all Copilot plans in Visual Studio Code, the GitHub Copilot app, GitHub Copilot CLI, and JetBrains IDEs. Support for additional clients is coming soon.</p>
<p>Update your client to try it out. Open the model picker, select <strong>Copilot Fusion</strong>, and choose an effort level.</p>
<blockquote><p>
  Note for research preview participants: if you previously enabled auto, HydraFusion, or HydraFusion Max, your selections will automatically transition to the corresponding Copilot Fusion effort levels.
</p></blockquote>
<p>To learn more, see our documentation on <a href="https://docs.github.com/copilot/concepts/models/copilot-fusion?utm_source=changelog-docs-link-fusion&amp;utm_medium=changelog&amp;utm_campaign=universe-2026">GitHub Copilot Fusion</a> and share your feedback in the <a href="https://github.com/orgs/community/discussions/211017?utm_source=changelog-community-discussion-fusion&amp;utm_medium=changelog&amp;utm_campaign=universe-2026">GitHub Community</a>.</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#smarter-choices-for-developers" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Smarter choices for developers</span>
					</a>
				</li>
							<li>
					<a href="#more-control-for-administrators" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>More control for administrators</span>
					</a>
				</li>
							<li>
					<a href="#billing" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Billing</span>
					</a>
				</li>
							<li>
					<a href="#get-started" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Get started</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Smarter choices for developers</span></div>
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
									<a href="#smarter-choices-for-developers" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Smarter choices for developers</span>
									</a>
								</li>
															<li>
									<a href="#more-control-for-administrators" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>More control for administrators</span>
									</a>
								</li>
															<li>
									<a href="#billing" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Billing</span>
									</a>
								</li>
															<li>
									<a href="#get-started" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Get started</span>
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
			<a href="https://github.blog/changelog/2026/?label=enterprise-management-tools" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: enterprise management tools; ref_location:post footer;">enterprise management tools</a>
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
