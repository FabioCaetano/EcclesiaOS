# 0067 - Estabilizacao De Agenda, Recorrencia E Rotas Publicas

Data: 2026-05-07

## Contexto

O feedback de produto indicou tres bloqueios principais:

- Agenda retornava erro bruto/minificado do Prisma ao tentar criar evento em alguns cenarios.
- Recorrencia semanal, como culto todo domingo as 10h, nao gerava as proximas ocorrencias esperadas.
- Links publicos publicados no Vercel retornavam `404: NOT_FOUND` ao abrir direto.

## Decisao

Corrigir esses pontos antes de novas funcionalidades grandes.

## Detalhes

- A Agenda passa a falar em `Ambiente`, usando a lista de ambientes ativos.
- A API valida eventos antes de persistir e retorna mensagens amigaveis por campo.
- Erros de slug publico duplicado sao traduzidos para conflito compreensivel.
- Recorrencias `weekly` e `monthly` sao materializadas como filhos, assim como `cron`.
- O frontend publicado no Vercel deve redirecionar rotas internas para `index.html`.

## Consequencias

- O usuario consegue testar Agenda com feedback claro quando faltar campo ou houver conflito.
- Eventos recorrentes simples aparecem como ocorrencias reais no calendario e nos fluxos ligados a evento.
- Rotas publicas passam a funcionar quando abertas diretamente no navegador publicado.
