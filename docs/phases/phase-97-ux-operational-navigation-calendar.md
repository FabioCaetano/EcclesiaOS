# Fase 97 - UX Operacional 2.0: Navegacao E Calendario

## Objetivo

Iniciar a simplificacao de UX proposta no feedback mais recente, removendo a Agenda como aba principal e preparando o Calendario para virar a porta de entrada de eventos, cultos e agendas.

## Entregue

- A aba **Agenda** foi removida do menu lateral.
- O Calendario ganhou acao **Novo evento/agenda** para administradores.
- Eventos listados no detalhe do dia agora mostram acoes rapidas:
  - abrir;
  - editar;
  - excluir.
- Reservas no detalhe do dia continuam abrindo Ambientes.
- Pessoas com papel `member` deixam de ver modulos operacionais sensiveis:
  - Pessoas;
  - Ambientes;
  - Culto;
  - Mensagens;
  - Musicas.
- Ajuste visual da lista de itens do Calendario para suportar acoes sem quebrar no mobile.

## Escopo intencional desta fase

Esta fase e o primeiro corte da reorganizacao. A tela antiga de Agenda ainda existe internamente como editor transicional, acessada pelo botao do Calendario.

Ainda nao foi implementado nesta fase:

- abrir o formulario de edicao ja preenchido ao clicar em um evento especifico no Calendario;
- abrir a pagina do Culto ja filtrada pelo evento clicado;
- mover a lista completa de eventos para baixo do Calendario;
- remover definitivamente o modulo tecnico de Agenda.

## Arquivos alterados

- `apps/web/src/AppLayout.tsx`
- `apps/web/src/CalendarPage.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `packages/shared/src/index.ts`
- `docs/phases/phase-97-ux-operational-navigation-calendar.md`
- `docs/decisions/0097-ux-operational-navigation-calendar.md`
- `docs/decision-log.md`
- `docs/index.md`
- `docs/project-status.md`
- `docs/next-steps.md`
- `docs/roadmap.md`

## Validacao

- `npm run build:web`: pendente nesta execucao.

## Bloqueio de validacao

O ambiente atual nao permitiu execucao de comandos PowerShell no sandbox:

`CreateProcessAsUserW failed: 1920`

## Proxima fase recomendada

Concluir a consolidacao Agenda -> Calendario:

- selecionar evento do Calendario e abrir edicao preenchida;
- abrir Culto filtrado pelo evento selecionado;
- mover a lista de eventos/agendas para baixo do Calendario;
- confirmar exclusao de evento com mensagem clara;
- depois disso seguir para Check-in 2.0.
