# Prado Calçados - Catálogo Digital MVP

Catálogo digital para a marca Prado Calçados (botinas e botas).

## Stack

- **Frontend:** Next.js 16 (App Router), TailwindCSS 4, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (imagens)
- **Auth:** Supabase Auth
- **Deploy:** Vercel

## Setup

### 1. Clone e instale dependências

```bash
npm install
```

### 2. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o conteúdo de `supabase-schema.sql`
3. Em **Storage**, crie um bucket público chamado `imagens`
4. Em **Authentication > Providers**, ative Email/Password
5. Crie um usuário admin em **Authentication > Users**

### 3. Variáveis de ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Preencha com os dados do seu projeto Supabase (encontre em **Settings > API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Fontes (opcional)

Coloque os arquivos da fonte **Grift** em `public/fonts/`:
- `Grift-Regular.woff2`
- `Grift-Bold.woff2`
- `Grift-Medium.woff2`

Se não tiver a fonte, o sistema usará fallback para system-ui.

### 5. Rodar

```bash
npm run dev
```

### 6. Deploy no Vercel

Conecte o repositório na Vercel e configure as mesmas env vars.

## Admin

- URL: `/admin/login`
- Faça login com o usuário criado no Supabase Auth
- Gerencie produtos, imagens do carousel, cards e banners

## Estrutura

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── produtos/             # Listagem e detalhe do produto
│   ├── sobre/                # História e materiais
│   ├── parceiro/             # Seja Parceiro
│   ├── admin/                # Painel admin
│   │   ├── login/            # Login
│   │   ├── dashboard/        # Dashboard
│   │   ├── produtos/         # CRUD produtos
│   │   └── imagens/          # CRUD imagens
│   └── api/                  # API Routes
├── components/
│   ├── ui/                   # Button, Card, Input
│   ├── layout/               # Navbar, Footer
│   └── home/                 # Hero, ProductCards, Banner
├── lib/supabase/             # Clientes Supabase
└── types/                    # Tipos TypeScript
```

## Cores da Marca

| Nome       | Hex       |
|------------|-----------|
| Branco     | `#FFFCF4` |
| Safety     | `#FEC761` |
| Country    | `#9F5234` |
| Azul       | `#2C3B4E` |
| Marinho    | `#1C2632` |
| Bege       | `#CCC1A9` |
