-- ===========================================
-- Migration: Add content_format column to entries
-- ===========================================
-- Permite entries com formato "checklist" além de "text"
-- Checklist armazena JSON em content_text:
-- [{"text": "Item", "checked": false}]
-- ===========================================

ALTER TABLE entries ADD COLUMN IF NOT EXISTS content_format TEXT NOT NULL DEFAULT 'text';
