-- ===========================================
-- Migration: Add slug column to entries
-- ===========================================
-- Substitui UUID na URL por slug legível
-- Ex: /entry/bolo-de-cenoura-da-vo
-- ===========================================

-- 1. Add slug column
ALTER TABLE entries ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Generate slugs for existing entries
UPDATE entries
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRANSLATE(title,
        'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
        'aaaaaeeeeiiiioooooeuuuucnAAAAAEEEEIIIIOOOOOEUUUUCN'),
      '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g')
)
WHERE slug IS NULL;

-- 3. Handle duplicates by appending a short suffix
WITH dupes AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY user_id, slug ORDER BY created_at) AS rn
  FROM entries
)
UPDATE entries
SET slug = entries.slug || '-' || dupes.rn
FROM dupes
WHERE entries.id = dupes.id AND dupes.rn > 1;

-- 4. Make slug NOT NULL and add unique constraint per user
ALTER TABLE entries ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_user_slug ON entries (user_id, slug);
