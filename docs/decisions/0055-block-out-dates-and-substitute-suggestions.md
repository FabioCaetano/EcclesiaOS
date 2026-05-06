# Decisao 0055: Bloqueios De Data E Sugestao De Substitutos

## Status

Aceita.

## Contexto

A Fase 45 entregou Escalas vinculadas a eventos. Falta o operacional comum:

1. A pessoa precisar avisar que vai estar fora em uma data ("vou viajar dia 12").
2. O lider, quando alguem recusa uma escala, precisar saber quem da mesma equipe esta disponivel para substituir.

Hoje o lider precisa lembrar de cabeca quem nao pode servir e quem ja servi muito.

## Decisao

Implementar duas pecas conectadas:

### Bloqueios de data (block-outs)

```text
PersonBlockOut {
  id
  personId
  startDate     # YYYY-MM-DD
  endDate       # YYYY-MM-DD (inclusive; igual a startDate quando e um dia so)
  reason
  createdAt
  createdByUserId
}
```

- Pessoa autenticada cria/remove bloqueios no proprio `personId` via "Minha conta".
- Admin pode criar/remover bloqueios para qualquer pessoa.
- Lider/membro pode listar bloqueios (precisa enxergar para escalar).
- Endpoint `GET /block-outs` lista todos; `?personId=X` filtra.

### Sugestao automatica de substitutos

Quando uma atribuicao tem status `declined`, o lider/admin clica "Sugerir substituto" e o sistema retorna candidatos da mesma equipe rankeados.

- Endpoint `GET /serving-plans/:planId/substitutes/:assignmentId`.
- Resposta: lista de `personId` com nome e razao do ranking.
- Filtros aplicados:
  - Pessoa pertence a `memberPersonIds` da equipe (`group.id === plan.groupId`).
  - Pessoa nao tem bloqueio que cubra `plan.date`.
  - Pessoa nao esta atribuida a esse plano em outra posicao.
- Ordenacao: ascendente por contagem de atribuicoes confirmadas/pendentes nos planos dos ultimos 30 dias (mais leves primeiro).
- Acesso: `canManageModule(role, "serving")` ou lider do `groupId` do plano.

### UI

- AccountPage ganha card "Indisponibilidade" com lista dos meus bloqueios + form para criar (start, end, motivo).
- ServingPage: ao adicionar/editar pessoa em uma posicao, se a pessoa tem bloqueio cobrindo a data do plano, exibe alerta visual.
- ServingPage: cada atribuicao recusada mostra botao "Sugerir substituto" que abre uma lista com 3-5 candidatos, com botao "Escalar".

## Consequencias

- A igreja para de ter "fila de WhatsApp" para descobrir quem pode substituir.
- O bloqueio fica historico; admin enxerga padroes (X sempre bloqueia o terceiro domingo do mes).
- Modelo simples (data range + motivo); sem repeticao por enquanto.

## Nao Objetivos

- Recorrencia de bloqueios ("toda quinta-feira de manha").
- Notificacao automatica do lider quando alguem bloqueia data com escala existente.
- Confirmacao do substituto sugerido antes de escalar (lider escala, pessoa responde como sempre).
- Bloquear automaticamente o save de uma escala em data bloqueada (so alerta).
- Calendario visual proprio de bloqueios (ficar para futuro).
