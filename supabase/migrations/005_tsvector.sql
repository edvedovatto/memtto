-- ===========================================
-- Migration 005: Full-text search with tsvector
-- ===========================================

-- 1. Add search_vector column
ALTER TABLE entries ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_entries_search_vector
  ON entries USING GIN (search_vector);

-- 3. Backfill existing rows
UPDATE entries
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content_text, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C')
WHERE search_vector IS NULL;

-- 4. Trigger function to auto-update on insert/update
CREATE OR REPLACE FUNCTION entries_search_vector_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content_text, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger
DROP TRIGGER IF EXISTS trg_entries_search_vector ON entries;
CREATE TRIGGER trg_entries_search_vector
  BEFORE INSERT OR UPDATE OF title, content_text, tags
  ON entries
  FOR EACH ROW
  EXECUTE FUNCTION entries_search_vector_trigger();
