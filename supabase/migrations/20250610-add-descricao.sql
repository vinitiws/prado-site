-- Adiciona coluna descricao separada do subtitulo
ALTER TABLE site_imagens ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Garantir que cta_texto seja usado como buttonText (já existe na tabela)
