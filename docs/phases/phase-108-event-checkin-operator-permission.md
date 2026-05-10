# Fase 108 - Permissao Operacional Do Totem Evento

## Objetivo

Permitir que lideres operem o check-in de participantes no Totem Evento sem liberar criacao, edicao ou administracao completa da Agenda.

## Entregue

- Backend ganhou guarda operacional `requireEventOperator`.
- `GET /event-registrations` agora aceita `admin` e `leader`.
- `PATCH /event-registrations/:id/checkin` agora aceita `admin` e `leader`.
- Atualizacao de status, reenvio de confirmacao, criacao e edicao de evento continuam restritos ao fluxo administrativo.
- Totem Evento permite operacao para `admin` e `leader`.
- Check-in ganhou atalho **Totem evento** para eventos com inscricoes habilitadas.

## Decisao De Produto

Lider pode operar entrada de participantes, mas nao recebe automaticamente acesso total a Agenda. A permissao operacional e separada das permissoes administrativas.

## Fora De Escopo

- Selecionar operadores por evento.
- Papel novo `operator`.
- Token publico de totem sem login.
- Tela dedicada de configuracao de operadores.

## Validacao

- `npm run build:api`: pendente por bloqueio/limite do ambiente nesta execucao.
- `npm run build:web`: pendente por bloqueio/limite do ambiente nesta execucao.
- Bloqueio observado anteriormente: `CreateProcessAsUserW failed: 1920`.
