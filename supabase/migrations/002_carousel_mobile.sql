-- ============================================================
-- PRADO CALÇADOS - Migration 002: Mobile image support for carousel
-- Execute this SQL in the Supabase SQL Editor
-- ============================================================

-- Safely add storage_path column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_imagens' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE site_imagens ADD COLUMN storage_path TEXT;
  END IF;
END $$;

-- Safely add url_mobile column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_imagens' AND column_name = 'url_mobile'
  ) THEN
    ALTER TABLE site_imagens ADD COLUMN url_mobile TEXT;
  END IF;
END $$;

-- Safely add storage_path_mobile column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_imagens' AND column_name = 'storage_path_mobile'
  ) THEN
    ALTER TABLE site_imagens ADD COLUMN storage_path_mobile TEXT;
  END IF;
END $$;

-- Note: Existing records with NULL url_mobile will be handled by the frontend fallback
