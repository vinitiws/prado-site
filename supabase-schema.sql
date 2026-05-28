-- ============================================================
-- PRADO CALÇADOS - Database Schema (Supabase)
-- Execute this SQL in the Supabase SQL Editor
-- ============================================================

-- 1. CATEGORIAS
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBCATEGORIAS
CREATE TABLE subcategorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUTOS
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategoria_id UUID REFERENCES subcategorias(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ref TEXT NOT NULL,
  descricao_curta TEXT,
  descricao_completa TEXT,
  especificacoes JSONB DEFAULT '{}',
  destaque BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUTO IMAGENS
CREATE TABLE produto_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  ordem INTEGER DEFAULT 0,
  tipo TEXT DEFAULT 'galeria',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SITE IMAGENS (carousel, cards, banners)
CREATE TABLE site_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('carousel', 'card', 'banner')),
  url TEXT NOT NULL,
  link TEXT,
  titulo TEXT,
  subtitulo TEXT,
  cta_texto TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_produtos_slug ON produtos(slug);
CREATE INDEX idx_produtos_destaque ON produtos(destaque) WHERE destaque = TRUE;
CREATE INDEX idx_produtos_subcategoria ON produtos(subcategoria_id);
CREATE INDEX idx_produto_imagens_produto ON produto_imagens(produto_id);
CREATE INDEX idx_site_imagens_tipo ON site_imagens(tipo) WHERE ativo = TRUE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_imagens ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Public read subcategorias" ON subcategorias FOR SELECT USING (true);
CREATE POLICY "Public read produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Public read produto_imagens" ON produto_imagens FOR SELECT USING (true);
CREATE POLICY "Public read site_imagens" ON site_imagens FOR SELECT USING (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin all categorias" ON categorias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all subcategorias" ON subcategorias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all produtos" ON produtos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all produto_imagens" ON produto_imagens FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all site_imagens" ON site_imagens FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA: CATEGORIAS E SUBCATEGORIAS
-- ============================================================

-- SEGURANÇA
INSERT INTO categorias (nome, slug, descricao, ordem) VALUES
('Segurança', 'seguranca', 'Botinas e botas com proteção certificada ABNT. Biqueiras de aço, composite e PVC.', 1);

-- TRADICIONAIS
INSERT INTO categorias (nome, slug, descricao, ordem) VALUES
('Tradicionais', 'tradicionais', 'Couro legítimo, sola latex e acabamento artesanal. Conforto que dura.', 2);

-- ACESSÓRIOS
INSERT INTO categorias (nome, slug, descricao, ordem) VALUES
('Acessórios', 'acessorios', 'Palmilhas e itens complementares para seu calçado.', 3);

-- Subcategorias de Segurança (id = 1)
INSERT INTO subcategorias (categoria_id, nome, slug, descricao, ordem) VALUES
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Linha Segurança+', 'linha-seguranca-mais', 'Botinas e sapatos com cadarço e elástico', 1),
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Linha Alta Proteção', 'linha-alta-protecao', 'Botinas com palmilha antirperfuro, protetor de metatarso e sem costura', 2),
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Linha Essencial', 'linha-essencial', 'Botinas econômicas com biqueira PVC ou aço', 3),
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Linha Elite', 'linha-elite', 'Botinas e sapatos em couro Nobuck com solado Poliuretano', 4),
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Linha Militar', 'linha-militar', 'Coturno militar com zíper', 5),
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Linha Next', 'linha-next', 'Botas pretas, oliva, pinhão e queimado', 6),
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Adventure', 'adventure', 'Coturno conceito com cadarço em várias cores', 7),
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Linha Multiuso', 'linha-multiuso', 'Modelos multiuso BB65 e BB80', 8),
((SELECT id FROM categorias WHERE slug = 'seguranca'), 'Linha Social', 'linha-social', 'Sapatos sociais em couro vaqueta', 9);

-- Subcategorias de Tradicionais (id = 2)
INSERT INTO subcategorias (categoria_id, nome, slug, descricao, ordem) VALUES
((SELECT id FROM categorias WHERE slug = 'tradicionais'), 'Linha Soberano', 'linha-soberano', 'Botinas elástico em couro látego e nobuck com sola latex', 1),
((SELECT id FROM categorias WHERE slug = 'tradicionais'), 'Linha Conchinha', 'linha-conchinha', 'Botinas elástico costuradas a mão em couro látego', 2),
((SELECT id FROM categorias WHERE slug = 'tradicionais'), 'Linha Rústica', 'linha-rustica', 'Botinas jau em couro látego e nobuck', 3),
((SELECT id FROM categorias WHERE slug = 'tradicionais'), 'Linha Texana', 'linha-texana', 'Botinas texanas em couro látego com sola borracha', 4),
((SELECT id FROM categorias WHERE slug = 'tradicionais'), 'Tradicionais Kids', 'tradicionais-kids', 'Botinas infantis jau em couro nobuck e látego', 5);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Execute in Supabase Storage > Create bucket "imagens"
-- Make it public for reading images

-- Storage RLS policies (run after creating the bucket)
-- CREATE POLICY "Public read imagens" ON storage.objects FOR SELECT USING (bucket_id = 'imagens');
-- CREATE POLICY "Authenticated upload imagens" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'imagens' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated delete imagens" ON storage.objects FOR DELETE USING (bucket_id = 'imagens' AND auth.role() = 'authenticated');
