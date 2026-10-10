---
product: github-copilot
version: "2026-10-06-update-your-ide-to-restore-agent-activity-in-copilot-usage-metrics"
released_at: "2026-10-06"
source_url: "https://github.blog/changelog/2026-10-06-update-your-ide-to-restore-agent-activity-in-copilot-usage-metrics"
fetched_at: "2026-10-10"
title: "Update your IDE to restore agent activity in Copilot usage metrics"
---

# github-copilot — Update your IDE to restore agent activity in Copilot usage metrics

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
	<time datetime="2026-10-06">
	October 6, 2026</time>			•
		3 minute read	</div>
		<h1 class="Heading--2">Update your IDE to restore agent activity in Copilot usage metrics</h1>
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
					<a href="#update-your-ide" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Update your IDE</span>
					</a>
				</li>
							<li>
					<a href="#what-to-expect-in-your-reports" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>What to expect in your reports</span>
					</a>
				</li>
							<li>
					<a href="#why-client-side-metrics-can-differ-from-other-copilot-data" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Why client-side metrics can differ from other Copilot data</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Update your IDE</span></div>
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
									<a href="#update-your-ide" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Update your IDE</span>
									</a>
								</li>
															<li>
									<a href="#what-to-expect-in-your-reports" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>What to expect in your reports</span>
									</a>
								</li>
															<li>
									<a href="#why-client-side-metrics-can-differ-from-other-copilot-data" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Why client-side metrics can differ from other Copilot data</span>
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
				
<p>If your Copilot usage metrics have shown agent activity or agent lines of code falling while Copilot usage kept growing, we’ve found the cause, and a fix is rolling out to each IDE. Several IDEs recently moved Copilot agent sessions to the Copilot SDK. Those sessions didn’t identify which IDE they came from, so usage metrics couldn’t attribute them correctly. Most of that activity was left out of reports, and some was counted as Copilot CLI activity. Only IDE versions that use the Copilot SDK for agent mode are affected. Developers on earlier versions are still counted.</p>
<p>The fix is available now in Visual Studio Code. Other IDEs will receive it in upcoming releases, which we expect to finish rolling out by November 2026. Once developers update, their agent activity is counted again in the Copilot usage metrics dashboard and API.</p>
<h3 id="update-your-ide"><a class="heading-link" href="#update-your-ide">Update your IDE<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Agent activity is counted again once developers are on these versions. If your developers are on an affected version, update as soon as the fixed version is available, because their activity can’t be recovered later. If you manage IDE versions centrally and rely on agent metrics, you can plan your rollout to move developers directly to these versions.</p>
<div data-target="content-table-wrap.container" class="content-table-wrap"><content-table-wrap><table>
<thead>
<tr>
<th align="left">IDE</th>
<th align="left">Version</th>
<th align="left">Availability</th>
</tr>
</thead>
<tbody>
<tr>
<td align="left">Visual Studio Code</td>
<td align="left">1.139.0 and later</td>
<td align="left">Available now</td>
</tr>
<tr>
<td align="left">Visual Studio</td>
<td align="left">18.12</td>
<td align="left">Not yet released, expected in October 2026</td>
</tr>
<tr>
<td align="left">JetBrains IDEs</td>
<td align="left">Next plugin release</td>
<td align="left">Not yet released, expected by late October 2026</td>
</tr>
<tr>
<td align="left">Eclipse</td>
<td align="left">Next plugin release</td>
<td align="left">Not yet released, expected by November 2026</td>
</tr>
<tr>
<td align="left">Xcode</td>
<td align="left">Next plugin release</td>
<td align="left">Not yet released, expected by November 2026</td>
</tr>
</tbody>
</table></content-table-wrap></div>
<p>We’ll add each version to the <a href="https://docs.github.com/copilot/concepts/billing-and-usage/copilot-usage-metrics/copilot-metrics#supported-ides">supported IDEs</a> in the docs as it ships.</p>
<h3 id="what-to-expect-in-your-reports"><a class="heading-link" href="#what-to-expect-in-your-reports">What to expect in your reports<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<ul>
<li>Billing isn’t affected. This issue only changed how agent activity was attributed in usage metrics, not what you were charged.</li>
<li>The gap persists for any developer on an affected IDE version until they update. Until then, their agent interactions and agent lines of code (e.g., <code>loc_added_sum</code> and <code>loc_deleted_sum</code> for <code>agent_edit</code>) stay undercounted. This applies to enterprise, organization, and user reports, for both 1-day and 28-day reports.</li>
<li>We can’t backfill missing data. Activity from affected IDE versions doesn’t identify which IDE it came from, so it can’t be attributed after the fact. Expect a gradual recovery as developers move to these versions rather than a single jump.</li>
<li>Copilot CLI metrics may be inflated, because some activity from other SDK-based clients was counted as Copilot CLI activity. This will clear up as developers update those clients, but earlier Copilot CLI metrics can’t be corrected, because that activity can’t be separated from real Copilot CLI use. Copilot CLI users don’t need to update.</li>
</ul>
<h3 id="why-client-side-metrics-can-differ-from-other-copilot-data"><a class="heading-link" href="#why-client-side-metrics-can-differ-from-other-copilot-data">Why client-side metrics can differ from other Copilot data<span class="heading-hash pl-2 text-italic text-bold" aria-hidden="true"></span></a></h3>
<p>Most detailed usage metrics (e.g., feature, language, model, and lines of code breakdowns) come from telemetry that each IDE sends. GitHub also records server-side data when Copilot handles a request. That data reliably shows who was active, but it can’t see what happens in the editor. When your reports and other Copilot data disagree, the gap is usually on the client side:</p>
<ul>
<li><strong>Telemetry is turned off</strong> in the IDE, so no detailed activity is sent.</li>
<li><strong>A network proxy or firewall</strong> blocks the Copilot telemetry endpoint.</li>
<li><strong>The IDE or Copilot extension is out of date</strong> and doesn’t send the events that metrics rely on.</li>
<li><strong>The client changed how it sends telemetry</strong>, as with the Copilot SDK change above.</li>
<li><strong>The client doesn’t send Copilot telemetry</strong>, such as an unsupported or third-party editor.</li>
</ul>
<p>We’re steadily reducing how much your reports depend on client telemetry. Usage metrics now use server-side data to <a href="https://github.blog/changelog/2026-06-15-copilot-usage-metrics-now-include-more-of-your-active-users/">count active users that client telemetry misses</a> and to <a href="https://github.blog/changelog/2026-07-02-improved-accuracy-and-coverage-in-copilot-usage-metrics-reports/">identify the IDE for those users</a>, and we’re continuing to expand where server-side data can fill in. Some detail, such as lines of code and accepted suggestions, can only come from the editor, so client-side gaps won’t disappear entirely. The most reliable way to keep your metrics complete is to manage your developers’ environments:</p>
<ul>
<li><strong>Keep IDEs and Copilot extensions current.</strong> Use your device management tooling to enforce minimum versions where you can.</li>
<li><strong>Keep IDE telemetry enabled</strong> and allow the Copilot telemetry endpoint through proxies and firewalls.</li>
<li><strong>Spot outdated clients in your reports.</strong> In per-user reports, <code>totals_by_ide</code> includes <code>last_known_ide_version</code> and <code>last_known_plugin_version</code> for each user.</li>
</ul>
<p>To learn how usage metrics combine client-side and server-side telemetry, see <a href="https://docs.github.com/copilot/concepts/billing-and-usage/copilot-usage-metrics/copilot-metrics#which-usage-is-included">Which usage is included?</a> in the Copilot usage metrics documentation.</p>

			</div>
			<div id="sidebar" class="PostContent-aside" style="position: relative;">
				<nav aria-labelledby="table-of-contents-title" class="TableOfContents-wrap">
	<h2 id="table-of-contents-title" class="sr-only">Table of Contents</h2>
	<table-of-contents>
		<focus-trap tabindex="0" role="button" data-order="last"></focus-trap>
		<ul class="TableOfContents TableOfContents-desktop">
							<li>
					<a href="#update-your-ide" class="TableOfContents-item" aria-current="location">
						<span class="TableOfContents-marker"></span>
						<span>Update your IDE</span>
					</a>
				</li>
							<li>
					<a href="#what-to-expect-in-your-reports" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>What to expect in your reports</span>
					</a>
				</li>
							<li>
					<a href="#why-client-side-metrics-can-differ-from-other-copilot-data" class="TableOfContents-item" aria-current="false">
						<span class="TableOfContents-marker"></span>
						<span>Why client-side metrics can differ from other Copilot data</span>
					</a>
				</li>
					</ul>

		<details class="TableOfContents-mobile" data-target="table-of-contents.details">
			<summary class="TableOfContents-summary">
				<div class="TableOfContents-summary-text"><span class="sr-only">Menu. Currently selected: </span><span data-target="table-of-contents.current-label">Update your IDE</span></div>
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
									<a href="#update-your-ide" class="TableOfContents-item" aria-current="location">
										<span class="TableOfContents-marker"></span>
										<span>Update your IDE</span>
									</a>
								</li>
															<li>
									<a href="#what-to-expect-in-your-reports" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>What to expect in your reports</span>
									</a>
								</li>
															<li>
									<a href="#why-client-side-metrics-can-differ-from-other-copilot-data" class="TableOfContents-item" aria-current="false">
										<span class="TableOfContents-marker"></span>
										<span>Why client-side metrics can differ from other Copilot data</span>
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
			<a href="https://github.blog/changelog/2026/?label=account-management" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: account management; ref_location:post footer;">account management</a>
			<a href="https://github.blog/changelog/2026/?label=copilot" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: copilot; ref_location:post footer;">copilot</a>
			<a href="https://github.blog/changelog/2026/?label=enterprise-management-tools" class="Tag Tag--lg" data-analytics-click="Changelog, click tag link, text: enterprise management tools; ref_location:post footer;">enterprise management tools</a>
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
