-- Phase 3: Database Evolution
-- Run this in Supabase SQL Editor AFTER the initial schema.sql

-- Add new nullable columns to entries table
ALTER TABLE entries ADD COLUMN IF NOT EXISTS rating smallint NULL;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS price_cents integer NULL;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Backfill updated_at for existing rows
UPDATE entries SET updated_at = created_at WHERE updated_at IS NULL;

-- Add check constraint for rating (1-5)
ALTER TABLE entries ADD CONSTRAINT chk_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Add check constraint for price_cents (non-negative)
ALTER TABLE entries ADD CONSTRAINT chk_price_cents CHECK (price_cents IS NULL OR price_cents >= 0);

-- RLS policy: Users can update their own entries
CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
