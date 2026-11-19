-- Execute primeiro esta consulta no Supabase SQL Editor.
-- Se houver resultados, resolva os cadastros repetidos com a organização ANTES de criar o índice.
select lower(btrim(email)) as email, count(*) as quantidade,
       array_agg(id order by criado_em) as inscricoes
from public.inscricoes
group by lower(btrim(email))
having count(*) > 1;

-- SOMENTE quando a consulta acima retornar ZERO linhas, execute:
-- (execute a instrução abaixo separadamente da consulta)
create unique index if not exists inscricoes_email_unico_idx
on public.inscricoes (lower(btrim(email)));
