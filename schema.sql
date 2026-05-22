-- claude-synergy schema — local mirror of every Anthropic product's release notes
-- Forward-looking design; not yet implemented. See README.md for tier roadmap.
-- Run with: sqlite3 claude-synergy.db < schema.sql

-- ============================================================================
-- PRODUCTS
-- ============================================================================
-- One row per surface (Claude Code, Claude API, Claude Agent SDK Python, etc.)

CREATE TABLE products (
  name             TEXT PRIMARY KEY,            -- "claude-code" | "claude-api" | "claude-agent-sdk-python" | "anthropic-apps" | "skills" | ...
  display_name     TEXT NOT NULL,               -- "Claude Code", "Claude API", "Claude Agent SDK (Python)"
  source_tier      INTEGER NOT NULL,            -- 1=GH Releases, 2=GH CHANGELOG.md, 3=HTML, 4=Catalog repo, 5=Third-party
  source_url       TEXT NOT NULL,
  fetch_strategy   TEXT NOT NULL,               -- "gh-releases" | "git-changelog" | "webfetch" | "git-snapshot"
  notes            TEXT
);

-- ============================================================================
-- RELEASES (per product)
-- ============================================================================

CREATE TABLE releases (
  product          TEXT NOT NULL REFERENCES products(name) ON DELETE CASCADE,
  version          TEXT NOT NULL,               -- "2.1.147" | "v0.2.82" | "2026-05-19" (date when no version)
  released_at      DATE,
  notes_path       TEXT NOT NULL,               -- relative path under repo, e.g. "products/claude-code/releases/2.1.147.md"
  fetched_at       DATETIME NOT NULL,
  source_url       TEXT NOT NULL,
  bundle_size_kb   REAL,                        -- delta vs prior, when available
  notes_hash       TEXT,                        -- sha256 of normalized notes body for change detection
  PRIMARY KEY (product, version)
);

CREATE INDEX idx_releases_date ON releases(released_at);

-- ============================================================================
-- CHANGES (per release)
-- ============================================================================

CREATE TABLE changes (
  id               INTEGER PRIMARY KEY,
  product          TEXT NOT NULL,
  version          TEXT NOT NULL,
  ordinal          INTEGER NOT NULL,            -- order within release (1-based)
  kind             TEXT NOT NULL,               -- "added" | "fixed" | "renamed" | "deprecated" | "breaking" | "improved" | "removed" | "internal"
  text             TEXT NOT NULL,               -- the original bullet, verbatim
  FOREIGN KEY (product, version) REFERENCES releases(product, version) ON DELETE CASCADE,
  UNIQUE (product, version, ordinal)
);

CREATE INDEX idx_changes_pv ON changes(product, version);
CREATE INDEX idx_changes_kind ON changes(kind);

-- ============================================================================
-- ENTITIES (extracted from change text)
-- ============================================================================
-- One row per detected entity per change. Lets us query "when was CLAUDE_CODE_WORKFLOWS introduced?"

CREATE TABLE entities (
  id               INTEGER PRIMARY KEY,
  change_id        INTEGER NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  entity_type      TEXT NOT NULL,               -- "env_var" | "slash_command" | "cli_option" | "tool" | "hook_event" | "setting_key" | "config_key" | "model_id" | "beta_header" | "api_endpoint"
  entity_value     TEXT NOT NULL                -- "CLAUDE_CODE_WORKFLOWS" | "/code-review" | "--config" | "Workflow" | "claude-opus-4-7" | "fast-mode-2026-02-01"
);

CREATE INDEX idx_entities_value ON entities(entity_type, entity_value);
CREATE INDEX idx_entities_change ON entities(change_id);

-- ============================================================================
-- FTS5 over change text
-- ============================================================================

CREATE VIRTUAL TABLE changes_fts USING fts5(text, content='changes', content_rowid='id');
CREATE TRIGGER changes_fts_insert AFTER INSERT ON changes BEGIN
  INSERT INTO changes_fts(rowid, text) VALUES (new.id, new.text);
END;
CREATE TRIGGER changes_fts_delete AFTER DELETE ON changes BEGIN
  INSERT INTO changes_fts(changes_fts, rowid, text) VALUES('delete', old.id, old.text);
END;

-- ============================================================================
-- MARKERS — "what have I seen?" tracking, per product
-- ============================================================================

CREATE TABLE markers (
  product          TEXT NOT NULL REFERENCES products(name) ON DELETE CASCADE,
  name             TEXT NOT NULL,               -- "last_seen" | "last_synced"
  version          TEXT,
  updated_at       DATETIME NOT NULL,
  PRIMARY KEY (product, name)
);

-- ============================================================================
-- RELEVANCE — manually curated "this affects workflow X"
-- ============================================================================

CREATE TABLE relevance (
  id               INTEGER PRIMARY KEY,
  change_id        INTEGER NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  tag              TEXT NOT NULL,               -- "swarm-control-plane" | "memory-gate-hook" | "windows" | "ratchet-invalidates" | "urgent"
  note             TEXT,
  added_at         DATETIME NOT NULL
);

CREATE INDEX idx_relevance_change ON relevance(change_id);
CREATE INDEX idx_relevance_tag ON relevance(tag);

-- ============================================================================
-- SYNERGIES — curated cross-product workflows
-- ============================================================================
-- The Synergy layer is what makes this a product instead of a mirror.
-- Source: synergies/*.md files (markdown is the source of truth; parser populates these tables)

CREATE TABLE synergies (
  id               INTEGER PRIMARY KEY,
  name             TEXT NOT NULL UNIQUE,        -- "skill-portability" | "mcp-server-portability" | etc.
  title            TEXT NOT NULL,
  trigger          TEXT NOT NULL,               -- "when this workflow is the right answer"
  status           TEXT NOT NULL,               -- "confirmed" | "speculative" | "deprecated"
  last_validated   DATE NOT NULL,
  notes_path       TEXT NOT NULL                -- "synergies/01-skill-portability.md"
);

CREATE TABLE synergy_products (
  synergy_id       INTEGER NOT NULL REFERENCES synergies(id) ON DELETE CASCADE,
  product          TEXT NOT NULL REFERENCES products(name),
  PRIMARY KEY (synergy_id, product)
);

CREATE TABLE synergy_steps (
  synergy_id       INTEGER NOT NULL REFERENCES synergies(id) ON DELETE CASCADE,
  ordinal          INTEGER NOT NULL,
  text             TEXT NOT NULL,
  PRIMARY KEY (synergy_id, ordinal)
);

CREATE TABLE synergy_evidence (
  id               INTEGER PRIMARY KEY,
  synergy_id       INTEGER NOT NULL REFERENCES synergies(id) ON DELETE CASCADE,
  source_url       TEXT NOT NULL,
  quote            TEXT,
  source_kind      TEXT                          -- "changelog" | "docs" | "release-notes" | "blog" | "github-readme"
);

-- Link synergies to specific changelog entries that enable them
-- (e.g. synergy 07 cites Claude Code 2.1.147's /code-review --comment change)
CREATE TABLE synergy_change_refs (
  synergy_id       INTEGER NOT NULL REFERENCES synergies(id) ON DELETE CASCADE,
  change_id        INTEGER NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
  PRIMARY KEY (synergy_id, change_id)
);

CREATE INDEX idx_synergy_products ON synergy_products(product);
CREATE INDEX idx_synergy_change_refs_change ON synergy_change_refs(change_id);
