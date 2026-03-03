-- ===========================================
-- Migration 006: Context settings (icons)
-- ===========================================

CREATE TABLE IF NOT EXISTS context_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📁',
  UNIQUE(user_id, name)
);

ALTER TABLE context_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own context settings"
  ON context_settings FOR ALL USING (auth.uid() = user_id);
