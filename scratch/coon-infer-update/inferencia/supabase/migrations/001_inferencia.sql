-- =============================================================================
-- [SUPABASE] 001_inferencia.sql — tabelas do COON Infer
-- -----------------------------------------------------------------------------
-- Aplicar no projeto "coon" (sa-east-1) pelo SQL Editor do Supabase.
-- Segue a regra já adotada no COON: RLS ligado em todas as tabelas e NENHUM
-- acesso para anon/authenticated. Só o servidor (chave secreta, guardada em
-- variável de ambiente no Railway) lê e grava. O navegador nunca fala direto
-- com o banco.
--
-- LGPD: amostra de mercado guarda nome e telefone de corretor/imobiliária
-- (contato comercial). Dado de proprietário/mutuário com CPF NÃO entra aqui.
-- =============================================================================

-- Projetos (arquivo de trabalho de cada avaliação). O projeto inteiro vai numa
-- coluna jsonb: variáveis, amostras, avaliando e modelo escolhido. Isso deixa
-- o formato idêntico ao arquivo .json que o engenheiro baixa.
create table if not exists public.inferencia_projetos (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,                       -- dono (mesmo e-mail do login único COON)
  nome         text not null default '',
  tipologia    text not null default '',
  municipio    text not null default '',
  dados        jsonb not null,                      -- projeto completo
  resumo       jsonb,                               -- R², graus etc. do último cálculo (para a lista)
  criado_em    timestamptz not null default now(),
  alterado_em  timestamptz not null default now(),
  excluido_em  timestamptz                          -- exclusão lógica: some da lista, dá para recuperar
);
create index if not exists inferencia_projetos_email on public.inferencia_projetos (email, alterado_em desc);

-- Banco de mercado pessoal: cada oferta/transação pesquisada fica guardada e
-- pode ser reaproveitada em outros laudos da mesma região.
create table if not exists public.inferencia_mercado (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  natureza     text not null check (natureza in ('oferta','transacao')),
  tipologia    text not null default '',
  municipio    text not null default '',
  uf           text not null default '',
  endereco     text not null default '',
  bairro       text not null default '',
  informante   text not null default '',
  telefone     text not null default '',
  link         text not null default '',
  data_evento  date,
  preco        numeric,
  area         numeric,
  unidade_area text not null default '',
  lat          double precision,
  lon          double precision,
  atributos    jsonb not null default '{}'::jsonb,  -- quartos, vagas, topografia, acesso...
  origem       text not null default 'manual',      -- manual | anuncio-colado | supadata | csv
  -- compartilhado = o engenheiro autorizou que a amostra vire "dado do sistema"
  -- para outros usuários da COON. Ao compartilhar, informante e telefone NÃO
  -- são mostrados a terceiros (o servidor apaga esses campos na leitura).
  compartilhado boolean not null default false,
  criado_em    timestamptz not null default now()
);
create index if not exists inferencia_mercado_busca on public.inferencia_mercado (email, municipio, tipologia);
create index if not exists inferencia_mercado_sistema on public.inferencia_mercado (compartilhado, municipio, tipologia) where compartilhado;

-- Trilha de uso (quem calculou o quê e quando) — útil em perícia contestada.
create table if not exists public.inferencia_auditoria (
  id         bigint generated always as identity primary key,
  email      text not null,
  projeto_id uuid,
  acao       text not null,
  detalhe    jsonb,
  quando     timestamptz not null default now()
);

alter table public.inferencia_projetos  enable row level security;
alter table public.inferencia_mercado   enable row level security;
alter table public.inferencia_auditoria enable row level security;

revoke all on public.inferencia_projetos  from anon, authenticated;
revoke all on public.inferencia_mercado   from anon, authenticated;
revoke all on public.inferencia_auditoria from anon, authenticated;

-- Catálogo do login único: registra o programa (codigo, nome, disponivel e
-- preco são as colunas que o servidor do COON lê). Só insere se ainda não
-- existir — não depende de a coluna "codigo" ter restrição de unicidade.
insert into public.aplicativos (codigo, nome, disponivel, preco)
select 'inferencia', 'COON Infer', true, 0
where not exists (select 1 from public.aplicativos where codigo = 'inferencia');
