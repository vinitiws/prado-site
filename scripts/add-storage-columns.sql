-- ============================================================
-- Migration: Add storage columns to site_imagens
-- Run this in the Supabase SQL Editor
-- ============================================================

ALTER TABLE site_imagens ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE site_imagens ADD COLUMN IF NOT EXISTS storage_path_mobile TEXT;
