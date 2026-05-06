# Fase 53: Mensagens Em Lote Para Pessoas

## Objetivo

Criar a infra para a igreja contatar grupos de pessoas: filtros dinamicos sobre `Pessoas`, selecao em lote, composicao de mensagem e registro do envio. Sem enviar email/SMS de fato (sem provedor); usar `wa.me` e `mailto:` no dispositivo do operador.

## Status

Concluida.

## Escopo

### Backend

- Tipos `PeopleMessage`, `PeopleMessageInput` em `packages/shared`.
- Migration Prisma criando `PeopleMessageRecord` com `recipientPersonIds Json`.
- `peopleMessageRepository` com `list`, `listForPerson(personId)`, `create`.
- Endpoints:
  - `GET /people-messages` (autenticado)
  - `POST /people-messages` (admin ou lider)
- Audit log no envio.

### Frontend

- Novo modulo `messages` no nav (grupo Operacao).
- Tela `MessagesPage` com:
  - filtros (status, email/telefone presentes, grupo, registrado depois de X, busca textual)
  - lista de pessoas com checkboxes
  - composicao (titulo + corpo + canal)
  - botao "Enviar" abre links `mailto:` ou `wa.me` no canal escolhido
  - historico de mensagens enviadas com contagem de destinatarios e clique para detalhe

## Fora De Escopo

- Provedor de email/SMS real.
- Templates reutilizaveis.
- Confirmacao de leitura, threads, replies.
- Mensagens para usuarios (so pessoas).
- Recorrencia de mensagens.

## Criterios De Aceite

- Filtros combinaveis afetam a lista de selecao.
- Selecionar pessoas e enviar gera `PeopleMessage` no banco.
- Historico mostra mensagens com data, remetente e contagem de destinatarios.
- Detalhe de uma mensagem mostra os destinatarios.
- Membro consegue listar historico mas nao envia (403 no POST).
- Lider envia, admin envia.

## Verificacao

```powershell
npm.cmd run build --workspace @ecclesiaos/shared
npm.cmd run db:generate
npm.cmd run typecheck
npm.cmd run db:migrate:deploy
npm.cmd run reset-dev-data
npm.cmd run db:verify
npm.cmd run test
npm.cmd run build
```

## Proxima Pergunta

Depois desta fase:

> Matrix view de equipes (multi-week), block-out dates + substituto automatico, ou integrar provedor de email para enviar de fato?
