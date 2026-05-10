# Fase 112 - Operadores Designados Por Evento

## Objetivo

Permitir que uma pessoa especifica opere o Totem Evento de um evento sem receber permissao completa para administrar a Agenda.

## Entregue

- `ChurchEvent` ganhou `operatorPersonIds: string[]`.
- Migration Prisma adiciona `EventRecord.operatorPersonIds` com default vazio.
- Agenda passa a permitir selecionar operadores do totem no cadastro/edicao do evento.
- Backend filtra inscricoes de evento para operadores designados quando o usuario nao e admin/lider.
- Check-in de ingresso valida se o usuario e admin, lider ou operador designado do evento.
- Totem Evento reconhece operadores designados e atualiza a mensagem de permissao.
- Eventos recorrentes materializados herdam operadores do evento mestre.

## Decisao De Produto

Operador designado e uma permissao por evento, vinculada a pessoa (`personId`) e nao ao cargo global do usuario. Isso evita abrir a administracao da Agenda para quem so precisa operar a entrada do evento no dia.

## Fora De Escopo

- Permissao por grupo/ministerio responsavel.
- Token temporario de totem sem login.
- Auditoria detalhada por operador em relatorio dedicado.
- Convite/notificacao automatica ao operador selecionado.

## Validacao

- `npm run db:generate`: concluido.
- `npm run build:api`: concluido.
- `npm run build:web`: concluido.
