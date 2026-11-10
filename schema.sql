create table if not exists public.inscricoes (
 id uuid primary key default gen_random_uuid(),
 nome text not null, email text not null, telefone text not null,
 nascimento date not null, cidade text not null,
 modalidade text not null check (modalidade in ('Corrida','Caminhada')),
 kit text not null check (kit in ('essencial','completo')),
 tamanho text, valor integer not null check (valor in (50,80)),
 status text not null default 'pendente' check (status in ('pendente','em_analise','confirmado_comprovante','pago','rejeitado','cancelado')),
 comprovante_path text, comprovante_enviado_em timestamptz,
 criado_em timestamptz not null default now(), pago_em timestamptz,
 revisado_em timestamptz
);
create index if not exists inscricoes_criado_em_idx on public.inscricoes(criado_em desc);
create index if not exists inscricoes_status_idx on public.inscricoes(status);
alter table public.inscricoes enable row level security;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('comprovantes','comprovantes',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;
-- Nenhuma policy pública: somente backend usando service role.

-- Em bancos já criados, atualize a restrição de status antes de usar a nova versão.
alter table public.inscricoes drop constraint if exists inscricoes_status_check;
alter table public.inscricoes add constraint inscricoes_status_check check (status in ('pendente','em_analise','confirmado_comprovante','pago','rejeitado','cancelado'));
