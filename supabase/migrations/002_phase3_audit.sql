-- Phase 3 Audit: Additional constraints, indexes, and policies
-- Run this in Supabase SQL Editor AFTER migration_phase3.sql

-- DELETE policy: Users can delete their own entries
CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);

-- Fix any rows with invalid type before adding constraint
UPDATE entries SET type = 'note'
  WHERE type NOT IN ('note', 'idea', 'snippet', 'experience');

-- Type constraint: enforce valid entry types
ALTER TABLE entries ADD CONSTRAINT chk_type
  CHECK (type IN ('note', 'idea', 'snippet', 'experience'));

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_entries_user_context
  ON entries(user_id, context);

CREATE INDEX IF NOT EXISTS idx_entries_user_created
  ON entries(user_id, created_at DESC);

-- GIN index for tag-based searches
CREATE INDEX IF NOT EXISTS idx_entries_tags
  ON entries USING GIN (tags);
