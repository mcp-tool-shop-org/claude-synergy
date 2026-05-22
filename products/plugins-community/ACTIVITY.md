# claude-plugins-community — activity log (2026-01-01 → 2026-05-21)

**Total commits in window:** 26
**Repo created:** 2026-03-20 (the window's earliest event — no prior history)
**Catalog growth trajectory:** 0 → 214 → 500 → 814 → 1,095 → 1,636 → 1,921 → 1,920 → 1,715 (current)
**Net new plugin entries added (sum of `+N` from sync titles):** 1,707
**Bulk-sync `cleaned up`/removed entries:** 210
**Updated in place (SHA bumps / metadata):** 453+ (only the 5-13 bulk sync surfaces this count explicitly)

## Cadence at a glance

The repo is bot-driven; humans rarely commit directly. Two distinct commit families dominate:

- **`sync:` / `Bulk sync:` commits (9 of 26)** — auto-vendor bot pulls newly approved submissions from the directory form and refreshes pinned SHAs. Cadence: ~weekly bursts in March-April when the marketplace was growing fast, slowing to one large bulk sync (2026-05-13) as growth plateaued.
- **CI/tooling commits (17 of 26)** — the [@tobin](https://github.com/tobin) work on validate/scan/bump composite actions in May built out the marketplace.json invariant suite (I10/I11), Claude-based policy scanner, and SHA bump bot. This is infrastructure work, not catalog churn.

Approximate cadence: **1.2 commits/week** in the window; effective catalog churn is dominated by 9 bulk-sync events rather than per-plugin commits, so weekly granularity is misleading.

## Chronological log

| Date | SHA | Type | Message |
|------|-----|------|---------|
| 2026-03-20 | `49a68b9` | bootstrap | Initial scaffold: README, LICENSE, empty marketplace, PR auto-close |
| 2026-03-23 | `3e9a035` | sync | Initial sync: 214 plugins (#2) |
| 2026-03-24 | `a800212` | sync | sync: 500 plugins (+286) |
| 2026-03-24 | `e8d5ef8` | merge | Merge pull request #3 from anthropics/sync/manual-2026-03-24 |
| 2026-03-31 | `349c219` | sync | sync: 814 plugins (+314) |
| 2026-04-01 | `4fa0017` | merge | Merge pull request #4 from anthropics/sync/manual-2026-03-31 |
| 2026-04-07 | `10711da` | sync | sync: 1095 plugins (+281) |
| 2026-04-10 | `7fa0c0f` | merge | Merge pull request #8 from anthropics/sync/manual-2026-04-07 |
| 2026-04-17 | `eab2acb` | sync | sync: 1636 plugins (+541) |
| 2026-04-17 | `dc8a0bc` | merge | Merge pull request #10 from anthropics/sync/manual-2026-04-17 |
| 2026-04-28 | `4749e7a` | sync | sync: 1921 plugins (+285) (#12) |
| 2026-05-01 | `c8567c2` | sync | sync: 1920 plugins (-1) (#15) |
| 2026-05-01 | `344848f` | ci/tooling | Add validate-plugins composite action |
| 2026-05-01 | `24fa6e8` | other | Address deep-review findings |
| 2026-05-01 | `7a773c6` | sync | sync: 1920 plugins (+0) |
| 2026-05-01 | `247ed1e` | merge | Merge pull request #17 from anthropics/sync/auto-vendor |
| 2026-05-01 | `5ef1664` | merge | Merge pull request #16 from anthropics/tobin/validate-plugins-action |
| 2026-05-04 | `32c1ece` | ci/tooling | validate-plugins: add I10/I11 invariants and static test suite |
| 2026-05-04 | `3d47fa2` | ci/tooling | Add scan-plugins companion action (Claude policy scan, bot-free) |
| 2026-05-04 | `993c840` | ci/tooling | Add bump-plugin-shas companion action (bot-free) |
| 2026-05-04 | `2b7a8a9` | other | Address review feedback on PR #19 |
| 2026-05-04 | `31b87ab` | merge | Merge pull request #19 from anthropics/tobin/plugin-ci-companions |
| 2026-05-05 | `f846a0b` | ci/tooling | Improve external-plugin error messages; add legacy manifest fallback (#20) |
| 2026-05-11 | `c41c691` | other | Create bump commits via GraphQL createCommitOnBranch (#25) |
| 2026-05-12 | `1d08c85` | ci/tooling | scan-plugins: fix verdict parsing and stdin consumption (#24) |
| 2026-05-13 | `2ec490e` | sync | Bulk sync: 666 plugin entries (453 updated, 4 added, 209 cleaned up) (#28) |

## Notable inflection points

- **2026-03-20** — Repo bootstrapped: README, LICENSE, empty `marketplace.json`, PR auto-close so submissions go through the directory form rather than as PRs against this repo.
- **2026-03-23** — Initial sync seeds 214 plugins (#2).
- **2026-04-17** — Largest single sync wave (+541 plugins, catalog jumps 1,095 → 1,636).
- **2026-05-01** — Tooling generation lands: `validate-plugins` composite action goes in alongside a `deep-review` pass. The same day, sync auto-vendor bot (#17) is wired up; from this point on, syncs are bot-authored rather than manual.
- **2026-05-04** — `scan-plugins` (Claude-based policy scanner, bot-free) and `bump-plugin-shas` companion actions land (PR #19). This separates plugin-policy enforcement from the validate-shape step.
- **2026-05-13** — Bulk sync (#28) cleans up 209 entries, updates 453, adds 4. Catalog drops to 1,715. This is the snapshot the CATALOG.md captures. The large `cleaned up` count suggests a one-time grooming pass — likely dead/abandoned submissions or rule-violation removals from the new scanner.

## What the activity *isn't*

This is **not** a per-plugin commit log. Per-plugin authoring lives in each submitter's own repo (1,414 unique owners). Tracking individual plugin updates would require crawling every linked repo's pinned SHA against its current HEAD — out of scope for this snapshot. The `bump-plugin-shas` action is the upstream mechanism that brings drift back into the catalog.
