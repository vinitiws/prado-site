-- Tabela para armazenar leads do formulário "Seja Parceiro"
-- Execute este SQL no SQL Editor do Supabase

create table if not exists parceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text,
  cidade_estado text,
  origem text default 'Site Prado Calçados',
  created_at timestamptz default now()
);

-- Índice para consultas por data
create index if not exists idx_parceiros_created_at on parceiros (created_at desc);

-- Índice para consultas por cidade/estado
create index if not exists idx_parceiros_cidade_estado on parceiros (cidade_estado);

-- Habilita Row Level Security (opcional, para o painel admin futuro)
alter table parceiros enable row level security;

-- Política para leitura (apenas autenticados com role admin)
create policy "Leitura apenas para admins" on parceiros
  for select
  using (auth.role() = 'authenticated');

-- Política para inserção (público, via API route)
create policy "Inserção pública via API" on parceiros
  for insert
  with check (true);
