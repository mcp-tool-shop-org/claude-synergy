---
product: github-copilot
version: "2026-10-07-purpose-built-model-for-leaked-secret-detection"
released_at: "2026-10-07"
source_url: "https://github.blog/changelog/2026-10-07-purpose-built-model-for-leaked-secret-detection"
fetched_at: "2026-10-10"
title: "Purpose-built model for leaked secret detection"
---

# github-copilot — Purpose-built model for leaked secret detection

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
	<time datetime="2026-10-07">
	October 7, 2026</time>			•
		4 minute read	</div>
		<h1 class="Heading--2">Purpose-built model for leaked secret detection</h1>
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
					<a href="#billing-notice-and-availability" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Billing notice and availability</span>
					</a>
				</li>
							<li>
					<a href="#ai-detected-alerts-remain-included-with-secret-protection" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>AI-detected alerts remain included with Secret Protection</span>
					</a>
				</li>
							<li>
					<a href="#ai-detected-alerts-are-coming-to-github-enterprise-server" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>AI-detected alerts are coming to GitHub Enterprise Server</span>
					</a>
				</li>
							<li>
					<a href="#ai-secret-detection-in-push-protection" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>AI secret detection in push protection</span>
					</a>
				</li>
							<li>
					<a href="#ai-secret-checks-in-github-copilot-security-review" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>AI secret checks in GitHub Copilot /security-review</span>
					</a>
				</li>
							<li>
					<a href="#plans-and-platforms" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Plans and platforms</span>
					</a>
				</li>
							<li>
					<a href="#manage-access-and-spending" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Manage access and spending</span>
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
									<a href="#billing-notice-and-availability" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Billing notice and availability</span>
									</a>
								</li>
															<li>
									<a href="#ai-detected-alerts-remain-included-with-secret-protection" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>AI-detected alerts remain included with Secret Protection</span>
									</a>
								</li>
															<li>
									<a href="#ai-detected-alerts-are-coming-to-github-enterprise-server" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>AI-detected alerts are coming to GitHub Enterprise Server</span>
									</a>
								</li>
															<li>
									<a href="#ai-secret-detection-in-push-protection" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>AI secret detection in push protection</span>
									</a>
								</li>
															<li>
									<a href="#ai-secret-checks-in-github-copilot-security-review" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>AI secret checks in GitHub Copilot /security-review</span>
									</a>
								</li>
															<li>
									<a href="#plans-and-platforms" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Plans and platforms</span>
									</a>
								</li>
															<li>
									<a href="#manage-access-and-spending" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Manage access and spending</span>
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
				
<p>Secret protection should keep pace with the way you build software, whether you write code yourself or work with an AI agent. With our new purpose-built model, we’re bringing context-aware detection into more developer workflows to help you catch secrets before they’re exposed.</p>
<h3 id="whats-new"><a class="heading-link" href="#whats-new">What’s new<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Today, we’re sharing plans for AI secret detection across secret scanning alerts, push protection, and GitHub Copilot security reviews. These features leverage GitHub’s fine-tuned model for secret detection. It reads surrounding code to identify likely credentials, including passwords without a recognizable token format, without generating code or prose.</p>
<p>Model availability:</p>
<ul>
<li><strong>Customers with AI-detected Password alerts have automatically been upgraded to the new model.</strong></li>
<li><strong>AI-detected secrets in push protection</strong> is available in private preview.</li>
<li><strong>AI-based secret scanning with the GitHub Copilot <code>/security-review</code> command</strong> for the Copilot CLI and Copilot app available soon in private preview.</li>
</ul>
<h3 id="billing-notice-and-availability"><a class="heading-link" href="#billing-notice-and-availability">Billing notice and availability<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p><strong>AI-detected secret alerts will remain included in GHSP and GHAS at no additional charge.</strong> The new opt-in checks for push protection and the security review command will consume GitHub AI Credits.</p>
<p><strong>We’re sharing their planned billing model ahead of broader availability so you can review access and spending before enabling them.</strong></p>
<p>This notice applies to the following features:</p>
<ul>
<li>AI-detected secrets in push protection for GitHub Secret Protection (GHSP) and GitHub Advanced Security (GHAS)</li>
<li>AI-based secret scanning with the GitHub Copilot <code>/security-review</code> command</li>
</ul>
<p>AI Credit usage for these opt-in checks will be introduced in the coming weeks.</p>
<h3 id="ai-detected-alerts-remain-included-with-secret-protection"><a class="heading-link" href="#ai-detected-alerts-remain-included-with-secret-protection">AI-detected alerts remain included with Secret Protection<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Starting today, existing <strong>AI-detected secret alert scans</strong> will automatically switch to the new model at no additional charge for GHSP and GHAS customers. These scans remain included in GHSP and GHAS, separate from the new credit-consuming checks.</p>
<h3 id="ai-detected-alerts-are-coming-to-github-enterprise-server"><a class="heading-link" href="#ai-detected-alerts-are-coming-to-github-enterprise-server">AI-detected alerts are coming to GitHub Enterprise Server<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>The model will also bring AI-detected alerts to <strong>GHES 3.23</strong> in public preview. This feature is included with an enterprise’s existing purchase of GHSP and GHAS.</p>
<h3 id="ai-secret-detection-in-push-protection"><a class="heading-link" href="#ai-secret-detection-in-push-protection">AI secret detection in push protection<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>AI push protection checks for unstructured credentials at push time, giving you a chance to remove a secret before it enters repository history. <strong>The feature will be available to customers on GitHub Enterprise Cloud or GitHub Teams with a purchase of GHSP or GHAS.</strong> An administrator must enable it, subject to your organization’s or enterprise’s policies.</p>
<p>The planned AI Credit usage will be billed to the organization that owns the repository. A check can consume credits even if it doesn’t block a push. Outside of user-namespace repositories for enterprise-managed users (EMUs), where usage is attributed to the pusher and apply to the user’s allocated credits, AI Credit usage will be attributed to the organization and will <strong>not</strong> apply to any specific user’s allocated credits. Usage will be listed under AI Credit consumption for the <strong>Secret Protection AI Credits</strong> SKU in your AI usage insights.</p>
<p>Billing begins once your organization opts into the public preview and enables the feature.</p>
<h3 id="ai-secret-checks-in-github-copilot-security-review"><a class="heading-link" href="#ai-secret-checks-in-github-copilot-security-review">AI secret checks in GitHub Copilot <code>/security-review</code><span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>In a supported Copilot CLI or Copilot App session, use <code>/security-review</code> before committing, pushing, or requesting pull request review. It reviews active changes for security vulnerabilities and returns prioritized findings with remediation suggestions.</p>
<p>Developers and coding agents can use the built-in <code>security-review</code> specialist, address confirmed findings with the appropriate authorization, and run the review again after fixes. The review is read-only—existing Copilot policies and billing apply.</p>
<p><strong>Coming soon, GitHub is adding checks from the secret classifier alongside the existing LLM-based review.</strong> You don’t need a GHSP or GHAS license to use these checks. The new checks will consume AI Credits in addition to the review’s existing usage. The billing account for your active Copilot plan will receive this usage, reported under GHSP in your AI usage insights. <strong>Billing begins once you opt into the public preview and enable the feature.</strong></p>
<p><strong>The new checks will be off by default.</strong> Running <code>/security-review</code> won’t enable them. You must opt in where your plan and policies allow. Agents shouldn’t enable credit-consuming features or change policies or budgets without explicit authorization.</p>
<p>See the <a href="https://docs.github.com/copilot/concepts/agents/copilot-cli/about-custom-agents#built-in-agents">Copilot CLI security-review agent documentation</a> and <a href="https://docs.github.com/copilot/how-tos/github-copilot-app/agent-sessions#using-security-review-in-app-sessions">security-review instructions for Copilot App sessions</a>.</p>
<h3 id="plans-and-platforms"><a class="heading-link" href="#plans-and-platforms">Plans and platforms<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>GitHub hosting plans, GHSP licenses, and Copilot subscriptions are separate. GitHub Enterprise (GHE) includes GitHub Enterprise Cloud (GHEC) and GitHub Enterprise Server (GHES). Copilot Enterprise is a separate Copilot subscription.</p>
<div data-target="content-table-wrap.container" class="content-table-wrap"><content-table-wrap><table>
<thead>
<tr>
<th>Plan or platform</th>
<th>Eligibility for these updates</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>GitHub Team and GHEC</strong> on github.com</td>
<td>AI push protection requires paid GHSP or GHAS coverage. Public, private, and internal repositories can qualify.</td>
</tr>
<tr>
<td><strong>GHEC with data residency</strong> on ghe.com</td>
<td>Copilot Business and Enterprise are supported plans on this platform with the Copilot security review command. AI push protection is planned with paid GHSP/GHAS coverage.</td>
</tr>
<tr>
<td><strong>GHES</strong></td>
<td>The new model is planned for AI-detected alerts in GHES 3.23, at no additional charge with GHSP/GHAS. AI push protection isn’t part of this Server release. The Copilot security review command isn’t part of this Server release.</td>
</tr>
<tr>
<td><strong>Individual Copilot plans</strong>: Pro, Pro+, Max, Free, and Student</td>
<td>Eligible for security review checks with the new model, subject to access controls and credit consumption. No GHSP or GHAS license is required.</td>
</tr>
<tr>
<td><strong>Copilot Business and Copilot Enterprise</strong></td>
<td>Eligible for security review checks with the new model on supported platforms, subject to invitation and administrator policies. These subscriptions don’t replace the GHSP license required for AI push protection.</td>
</tr>
</tbody>
</table></content-table-wrap></div>
<h3 id="manage-access-and-spending"><a class="heading-link" href="#manage-access-and-spending">Manage access and spending<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Organization and enterprise administrators will be able to disable the new capabilities by policy and set budgets for their AI Credit usage. Opting in won’t override those controls. Applicable included credits and any additional paid usage follow your account’s billing policies and limits.</p>
<p>To set a dedicated budget, open <strong>Billing and licensing</strong> and select <strong>Budgets and alerts</strong>. Choose <strong>SKU-level budget</strong>, <strong>Advanced Security</strong> as the product, and <strong>Secret Protection AI Credits</strong> as the SKU. An <strong>all AI Credits budget</strong> can cover multiple credit-consuming SKUs.</p>
<p>Budget alerts alone don’t stop usage. Configure <strong>Stop usage when budget limit is reached</strong> where available if you want a spending cap.</p>
<p>If you’re already using AI push protection in private preview, continued use after this billing change takes effect will consume AI Credits. Disable it beforehand if you don’t want that usage. AI-detected alert scanning remains included at no additional charge.</p>
<p>Before enabling or continuing the new checks, review the eligibility, AI Credit pricing, and billing details above, along with your <a href="https://docs.github.com/billing/how-tos/set-up-budgets">budget settings</a> and <a href="https://docs.github.com/enterprise-cloud@latest/copilot/concepts/billing-and-usage/organizations-and-enterprises/billing">documentation for usage-based billing</a>.</p>

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
					<a href="#billing-notice-and-availability" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Billing notice and availability</span>
					</a>
				</li>
							<li>
					<a href="#ai-detected-alerts-remain-included-with-secret-protection" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>AI-detected alerts remain included with Secret Protection</span>
					</a>
				</li>
							<li>
					<a href="#ai-detected-alerts-are-coming-to-github-enterprise-server" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>AI-detected alerts are coming to GitHub Enterprise Server</span>
					</a>
				</li>
							<li>
					<a href="#ai-secret-detection-in-push-protection" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>AI secret detection in push protection</span>
					</a>
				</li>
							<li>
					<a href="#ai-secret-checks-in-github-copilot-security-review" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>AI secret checks in GitHub Copilot /security-review</span>
					</a>
				</li>
							<li>
					<a href="#plans-and-platforms" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Plans and platforms</span>
					</a>
				</li>
							<li>
					<a href="#manage-access-and-spending" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Manage access and spending</span>
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
									<a href="#billing-notice-and-availability" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Billing notice and availability</span>
									</a>
								</li>
															<li>
									<a href="#ai-detected-alerts-remain-included-with-secret-protection" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>AI-detected alerts remain included with Secret Protection</span>
									</a>
								</li>
															<li>
									<a href="#ai-detected-alerts-are-coming-to-github-enterprise-server" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>AI-detected alerts are coming to GitHub Enterprise Server</span>
									</a>
								</li>
															<li>
									<a href="#ai-secret-detection-in-push-protection" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>AI secret detection in push protection</span>
									</a>
								</li>
															<li>
									<a href="#ai-secret-checks-in-github-copilot-security-review" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>AI secret checks in GitHub Copilot /security-review</span>
									</a>
								</li>
															<li>
									<a href="#plans-and-platforms" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Plans and platforms</span>
									</a>
								</li>
															<li>
									<a href="#manage-access-and-spending" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Manage access and spending</span>
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
			<a href="https://github.blog/changelog/2026/?label=application-security" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: application security; ref_location:post footer;">application security</a>
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
