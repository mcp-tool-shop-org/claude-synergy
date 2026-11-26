# claude-synergy: how it works

Mapped at 2026-11-26 from commit 7ebf55c by Atlas 1.26.0.

## What this is

10 parts, mostly Markdown (2470 files) and JSON data (317); code in TypeScript (89), JavaScript (10), HTML (3), CSS (2), Python (2), Astro (1) and shell (1). Work enters through 7 doors; Tests and Release each reach 3 parts, and Tests is followed because a pull request goes through it. It publishes to npm. It deploys a site to GitHub Pages. People run claude-synergy-mcp and hk.

## What changed since 2026-11-26 (10857e2)

Nothing structural changed since 2026-11-26; 14 files changed content.

## What comes in

1. **Tests.** On a pull request to main; on a push to main; or by hand. Runs test/integration/, test/regression/ and test/unit/; checks src/.
2. **Release.** When a tag matching `v*` is pushed; or by hand. Runs test/integration/, test/regression/ and test/unit/; builds src/cli.ts and src/mcp-server.ts.
3. **Daily sync.** On a schedule (`0 12 * * *`); or by hand. Runs scripts/check-stale-sync-pr.mjs and src/cli.ts; builds src/mcp-server.ts.
4. **Deploy site to GitHub Pages.** On a push to main touching 2 paths; or by hand. Runs site/astro.config.mjs and site/src/.
5. **@mcptoolshop/claude-synergy** (the package's entry, which runs the command hk; it is not a library). Loads src/cli.ts and src/mcp-server.ts.
6. **claude-synergy-mcp** (a command people run). Runs src/mcp-server.ts.
7. **hk** (a command people run). Runs src/cli.ts.

## What happens through Tests

1. The workflow runs test/integration/, test/regression/ and test/unit/ in test; it checks src/ in src.
2. That reaches scripts (1 file).
3. It uploads coverage to Codecov.

## Who reads the results

Tests writes nothing in the files this map could read; 1 file could not be.

## The other doors

**Release** runs test/integration/, test/regression/ and test/unit/, builds src/cli.ts and src/mcp-server.ts, reaches scripts, publishes to npm, and creates a GitHub release.

**Daily sync** runs scripts/check-stale-sync-pr.mjs and src/cli.ts, builds src/mcp-server.ts, writes to LATEST.txt and PRODUCTS.txt, commits LATEST.txt, PRODUCTS.txt, SOURCES.md (written by people), URGENT_FINDINGS.md (written by people), data/ and products/ (written by people), then pushes to a branch for review, never to main, runs gh, and opens a pull request.

**Deploy site to GitHub Pages** runs site/astro.config.mjs and site/src/, and deploys the site.

**@mcptoolshop/claude-synergy** (the package's entry, which runs the command hk; it is not a library) loads src/cli.ts and src/mcp-server.ts.

**claude-synergy-mcp** (a command people run) runs src/mcp-server.ts and runs gh.

**hk** (a command people run) runs src/cli.ts and runs gh.

## What breaks what

- **src** is run as a child process by 1 part (scripts) and sits on the path of 6 doors.
- **scripts** is imported only from tests, by 1 part (test), and sits on the path of 3 doors.
- **test** is imported by no other part and sits on the path of 2 doors.
- **dataset/changelog-actions/v1/entries/** is written by scripts and read by scripts; a hand edit reaches every reader.
- **dataset/changelog-actions/v1/holdout.jsonl** is written by scripts and read by scripts; a hand edit reaches every reader.

## What tends to change together

No two source files changed together often enough to name.

Window: 180 days; a pair counts from 3 shared commits, since 0 source files reach 10 revisions; the floor rises to 10 when 25 do.

## What no test touches

Every code part is imported by at least one test.

test/smoke/full-corpus.test.ts runs in no workflow.

verify.sh runs in no workflow.

## Written but never read

- **LATEST.txt** is written by .github/workflows/sync.yml and read by nothing else in this repository.
- **PRODUCTS.txt** is written by .github/workflows/sync.yml and read by nothing else in this repository.
- **dataset/changelog-actions/v1/eval-report-run1.json** is written by scripts/eval-cs-actions.mjs and read by nothing else in this repository.
- **dataset/changelog-actions/v1/eval-report.v1.json** is written by scripts/eval-cs-actions.mjs and read by nothing else in this repository.
- **dataset/changelog-actions/v1/judge-report.json** is written by scripts/judge-dataset.mjs and read by nothing else in this repository.
- **dataset/changelog-actions/v1/manifest.json** is written by scripts/build-dataset.mjs and read by nothing else in this repository.

## Helpers that look duplicated

No two parts export a helper that looks alike in the files this map could read; 1 file could not be.

## Generated, never hand-edited

- **LATEST.txt** is written by .github/workflows/sync.yml.
- **PRODUCTS.txt** is written by .github/workflows/sync.yml.
- **dataset/changelog-actions/v1/entries/** is written by scripts/apply-a3c-review.mjs.
- **dataset/changelog-actions/v1/eval-report-run1.json** is written by scripts/eval-cs-actions.mjs.
- **dataset/changelog-actions/v1/eval-report.v1.json** is written by scripts/eval-cs-actions.mjs.
- **dataset/changelog-actions/v1/holdout.jsonl** is written by scripts/build-dataset.mjs.
- **dataset/changelog-actions/v1/judge-report.json** is written by scripts/judge-dataset.mjs.
- **dataset/changelog-actions/v1/manifest.json** is written by scripts/build-dataset.mjs.
- **dataset/changelog-actions/v1/training.jsonl** is written by scripts/build-dataset.mjs.

## Hand-authored

People write .github/, docs/, products/, site/ and synergies/; 1 write with a path built at run time may land here.

## Where to start

src/mcp-server.ts → src/db.ts → src/errors.ts

Read those in order to follow one run of claude-synergy-mcp end to end. This path follows claude-synergy-mcp (a command people run) from its entry, since Tests runs only tests and checks.

## What this map cannot see

- 1 file uses syntax the parser cannot read (test/unit/db.binding.test.ts), so what it imports is not known.
- 1 write and 5 reads use paths built at run time and are not named here.
- 9 writes and 53 reads go to a path their caller passes, not to this repository.
- 7 reads go to the directory the command is run in (products.yaml, schema-vec.sql and schema.sql), not to this repository.
- 1 read goes to the directory the command is run in (data/) or a path its caller passes, not to this repository.
- Statistics confidence is low: fewer than 25 source files reach 10 revisions in the window.

Regenerate with `npx --yes @dogfood-lab/atlas map`.
