# Verify changelog findings with current web sources

Use Claude Synergy to find changes across your local corpus, then use
[Parallel Search MCP](https://docs.parallel.ai/integrations/mcp/search-mcp)
to check the relevant upstream release notes or migration guide. This is useful
when planning an upgrade, checking a deprecation deadline, or investigating a
feature that is newer than your last corpus sync.

Parallel provides `web_search` and `web_fetch` over HTTP. The anonymous endpoint
is free to use without an account or API key, at lower rate limits; anonymous
searches use Fast mode. It is an optional companion server in your MCP host.
Claude Synergy's local search and configured fetch sources stay unchanged.

## Connect both servers in Claude Code

First complete the [Claude Synergy installation and database setup](../README.md#install).
Initialize and ingest the local corpus if you have not already:

```bash
hk init
hk ingest
```

In your project's `.mcp.json`, merge the `parallel-search` entry below into the
existing `mcpServers` object. Keep your other entries and database path. The
complete example includes the local server for reference; replace the absolute
database path with your own.

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp",
      "env": {
        "CLAUDE_SYNERGY_DB": "/path/to/claude-synergy/data/claude-synergy.db"
      }
    },
    "parallel-search": {
      "type": "http",
      "url": "https://search.parallel.ai/mcp",
      "headers": {
        "User-Agent": "claude-synergy/parallel-research"
      }
    }
  }
}
```

Open Claude Code in that project and review the project MCP server approval
prompt. Run `/mcp` to confirm both servers are connected. The local server should
expose tools such as `search`, `sync_status`, and `get_release`; Parallel should
expose `web_search` and `web_fetch`. See the
[Claude Code MCP guide](https://code.claude.com/docs/en/mcp) for project scope and
connection troubleshooting. The Parallel endpoint above needs no sign-in.

## Research an upgrade

Ask your agent:

> Check the freshness of my local Claude Synergy corpus for claude-code, then
> find breaking changes from the last 30 days. For each change relevant to my
> upgrade, read the full release and verify it against current first-party
> release notes or migration documentation with Parallel. Return the product,
> version, release date, local finding, upstream URL, and any discrepancy.
> Clearly distinguish confirmed findings from claims you could not verify.

A useful sequence is:

1. Call Claude Synergy's `sync_status` for the product before treating local
   results as current. If stale, decide whether to refresh with `hk sync` or
   `sync_now`; fetching updates the local corpus and uses the network.
2. Use `search_breaking_changes` or `get_changes_since` with explicit date
   bounds, then `get_release` with the matching product and version. The full
   release includes its recorded source URL.
3. Use Parallel's `web_fetch` on that source URL. If you need a migration guide,
   or the source is missing or no longer available, use `web_search` with the
   product, version, and change text, preferring the project's own docs and
   release pages. Fetch the relevant result when the search excerpt is not
   enough to verify the claim.
4. Compare versions and publication dates before recommending an action. Keep
   local corpus findings and live-source evidence separately attributed. A
   missing result or unavailable page is an unverified claim, not evidence that
   a change did not happen.

The web tools do not ingest their results into Claude Synergy. Refreshing the
corpus still uses its configured fetch and ingest pipeline.

## Data and availability

Parallel receives the queries and URLs passed to its tools, and content from
those URLs is retrieved remotely. Keep private changelog text, credentials, and
internal URLs out of web requests. Tool calls to the local Claude Synergy server
remain separate from the remote companion.

If Parallel is unavailable or its free allowance is exhausted, use the local
corpus and report that current-source verification was unavailable. You can
remove just the `parallel-search` entry to return to a local-only configuration.
