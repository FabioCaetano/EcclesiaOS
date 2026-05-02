# Fase 16: Aprofundar Escalas

## Objetivo

Permitir confirmacao de voluntarios nas escalas e criar notificacoes internas iniciais de pendencias.

## Escopo

- Adicionar `personId` ao usuario atual.
- Vincular usuarios semente a pessoas.
- Criar endpoint para responder uma atribuicao de escala:

```text
PATCH /serving-plans/:planId/assignments/:assignmentId/status
```

- Criar endpoint de notificacoes internas:

```text
GET /serving-notifications
```

- Permitir que admin altere qualquer atribuicao.
- Permitir que lider/membro altere somente sua propria atribuicao.
- Atualizar tela Escalas com:
  - indicadores de pendentes, recusadas e notificacoes;
  - painel de pendencias;
  - botoes Confirmar/Recusar para a propria escala.

## Fora De Escopo

- Email real.
- WhatsApp/SMS.
- Link publico de resposta.
- Agenda completa de disponibilidade.
- Notificacoes persistidas em tabela propria.

## Criterios De Aceite

- Usuario autenticado recebe `personId`.
- Membro/lider pode responder a propria escala.
- Membro/lider nao pode responder escala de outra pessoa.
- Admin continua podendo ajustar status.
- Escalas pendentes/recusadas aparecem como notificacoes internas.

## Verificacao

- `npm.cmd run build --workspace @ecclesiaos/shared`: concluido.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build --workspace @ecclesiaos/api`: concluido.

Pendencias por limite do ambiente:

- `npm.cmd run db:generate`: pendente apos adicionar `personId` ao schema Prisma.
- `npm.cmd run test`: pendente porque execucao elevada foi bloqueada pelo limite do ambiente.
- `npm.cmd run build` completo: pendente se o Vite/esbuild exigir execucao elevada.

## Proxima Pergunta

Depois desta fase, seguindo a ordem definida, a proxima decisao sera:

> Queremos aprofundar Financeiro com filtros, recibos e relatorios?
