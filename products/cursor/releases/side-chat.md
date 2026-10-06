---
product: cursor
version: "side-chat"
released_at: "2026-07-10"
source_url: "https://cursor.com/changelog/side-chat"
fetched_at: "2026-10-06"
title: "Side Chats and Conversation Search"
---

# cursor — Side Chats and Conversation Search

<p>This release makes it easier to stay in flow with side chats that run alongside your main chat, the ability to search agent transcripts, and simplified project and repo pickers.</p>
<h2>Side chats</h2>
<p>Open a side chat to ask questions, explore ideas, and investigate tangents without interrupting your main agent conversation. Use `/side`, `/btw`, or the plus button at the top of the chat panel to create a new side chat that has context from the main chat.</p>
<p>Each side chat is a durable, full agent conversation that you can follow up on, revisit later, and at-mention to pull context back into the main thread.</p>
<p>By default, side chats focus on reading, searching, and answering. Use them to ask clarification questions, research alternatives without committing to a pivot, and sanity-check a decision while the main agent continues running.</p>
<h2>Conversation search</h2>
<p>Find past agent chats faster with search results that go beyond names and PR numbers. In the <a href="https://cursor.com/docs/agent/agents-window">Agents Window</a>, you can search agent transcripts from the command palette (Cmd+K). Cursor builds a local search index that scales search to thousands of conversations with snappy performance.</p>
<p>You can also search within an existing conversation using Cmd+F. Jump between matches, see a match counter, and keep searching as you scroll through long transcripts.</p>
<h2>Redesigned project and repo pickers</h2>
<p>We&#39;ve simplified the project and repo pickers and made them more powerful. You can now stay in the picker for workflows that used to send you elsewhere. For example, you can create a project and connect GitHub, GitLab, or Azure DevOps without leaving the picker.</p>
<p>&lt;figure&gt;&lt;img src=&quot;https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/redesigned-picker.png&quot; loading=&quot;lazy&quot; alt=&quot;Redesigned project and repo pickers&quot; /&gt;&lt;figcaption&gt;Redesigned project and repo pickers&lt;/figcaption&gt;&lt;/figure&gt;</p>
<p>Search is now scoped to where you&#39;re working—This Computer, Cloud, or a specific remote machine—instead of one global search box. You can also remove projects from Recents with one click.</p>
<h2>New cloud agent hooks</h2>
<p>Cloud agents already support team hooks around tool execution and file/shell work. We&#39;ve added new hooks that let you observe and control the agent conversation itself: prompts, responses, thinking, subagents, compaction, and turn completion. See all the supported hooks in our <a href="https://cursor.com/docs/hooks#cloud-agent-support">docs</a>.</p>
<p>New hooks like `beforeSubmitPrompt`, `afterAgentResponse`, `afterAgentThought`, `stop`, `subagentStart`, and more allow you to better observe output and reasoning, control subagents, and build self-correcting loops with cloud agents.</p>
<p>Picker Improvements</p>
<ul>
<li>Improved repo picker grouping with options under No Repo, On This Computer, and Cloud.</li>
<li>Added the &quot;Run on&quot; picker that shows where your agent can run (Cloud, This Computer, or Remote Machines) and drills into the relevant choices (environments, local options, and so on) from there.</li>
<li>The branch picker opens on your default branch and recently used branches instead of a long flat list, with search for everything else.</li>
<li>Removed the Home concept so working without a repo is an explicit No Repo choice.</li>
<li>Combined all remote options—your machines, team pools, and existing remote workspaces—into one searchable Remote Machines menu.</li>
<li>Multi-repo and multi-root selection is a Select Multiple toggle inside the Cloud and This Computer flyouts, replacing the separate Set Up Workspace builder.</li>
<li>Moved search to the top of the menu.</li>
<li>Simplified the footer.</li>
<li>Added the ability to find the No Repo option by typing `none` or `no repo`.</li>
<li>If a repo exists only in the cloud, the picker suggests cloning it locally.</li>
<li>Added clearer section dividers.</li>
<li>Added folder icons with a small cloud badge for cloud repos.</li>
<li>Removed redundant `Current` tag in the branch list.</li>
</ul>
