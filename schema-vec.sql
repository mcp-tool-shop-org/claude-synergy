-- Tier 2b — semantic layer (sqlite-vec + FTS5 over contextualized chunks)
-- Run after schema.sql. Tables here are independent of Tier 2a's changes_fts,
-- so naive FTS still works on the raw bullets while hybrid uses the contextualized layer.
--
-- Dimension: 768 (nomic-embed-text native; Voyage 3 truncatable via Matryoshka)
-- One row per change. Reranking deferred.

CREATE TABLE IF NOT EXISTS chunks (
  id                INTEGER PRIMARY KEY,
  change_id         INTEGER NOT NULL UNIQUE REFERENCES changes(id) ON DELETE CASCADE,
  product           TEXT NOT NULL,
  release_version   TEXT NOT NULL,
  released_at       DATE,
  context_prefix    TEXT NOT NULL,
  original_text     TEXT NOT NULL,
  contextualized    TEXT NOT NULL,
  context_provider  TEXT NOT NULL,
  embedding_model   TEXT NOT NULL,
  embedded_at       DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chunks_product ON chunks(product, released_at);
CREATE INDEX IF NOT EXISTS idx_chunks_change ON chunks(change_id);

-- Vector storage (sqlite-vec extension required)
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(
  embedding FLOAT[768]
);

-- FTS5 over the contextualized text (separate from changes_fts which indexes raw bullets)
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
  contextualized,
  content='chunks',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS chunks_fts_insert AFTER INSERT ON chunks BEGIN
  INSERT INTO chunks_fts(rowid, contextualized) VALUES (new.id, new.contextualized);
END;

CREATE TRIGGER IF NOT EXISTS chunks_fts_delete AFTER DELETE ON chunks BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, contextualized) VALUES('delete', old.id, old.contextualized);
END;
