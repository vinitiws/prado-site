-- ============================================================
-- PRADO CALÇADOS - Migration 001: Site Imagens + Storage Path
-- ============================================================

-- Create site_imagens table if not exists
CREATE TABLE IF NOT EXISTS site_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('carousel', 'card', 'banner')),
  url TEXT NOT NULL,
  url_mobile TEXT,
  storage_path TEXT NOT NULL,
  storage_path_mobile TEXT,
  link TEXT,
  titulo TEXT,
  subtitulo TEXT,
  cta_texto TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add storage_path columns if table already existed without them
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_imagens' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE site_imagens ADD COLUMN storage_path TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_imagens' AND column_name = 'storage_path_mobile'
  ) THEN
    ALTER TABLE site_imagens ADD COLUMN storage_path_mobile TEXT;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_imagens_tipo ON site_imagens(tipo) WHERE ativo = TRUE;

-- RLS
ALTER TABLE site_imagens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate
DROP POLICY IF EXISTS "Public read site_imagens" ON site_imagens;
DROP POLICY IF EXISTS "Admin all site_imagens" ON site_imagens;

-- Public read access
CREATE POLICY "Public read site_imagens" ON site_imagens
  FOR SELECT USING (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin all site_imagens" ON site_imagens
  FOR ALL USING (auth.role() = 'authenticated');

-- Storage bucket policies
DROP POLICY IF EXISTS "Public read imagens" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload imagens" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete imagens" ON storage.objects;

CREATE POLICY "Public read imagens" ON storage.objects
  FOR SELECT USING (bucket_id = 'imagens');

CREATE POLICY "Authenticated upload imagens" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'imagens' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete imagens" ON storage.objects
  FOR DELETE USING (bucket_id = 'imagens' AND auth.role() = 'authenticated');
