# Fase 98 - Calendario Com Acoes Contextuais

## Objetivo

Concluir a primeira consolidacao Agenda -> Calendario, fazendo as acoes do Calendario abrirem as telas internas ja no contexto do evento selecionado.

## Entregue

- O Calendario agora guarda o evento clicado como contexto de navegacao.
- A acao **Editar** no detalhe do dia abre a tela interna de Agenda com o formulario ja preenchido pelo evento selecionado.
- A acao **Abrir** em eventos abre **Culto** ja selecionando o evento clicado.
- A acao **Novo evento/agenda** limpa o contexto anterior antes de abrir o formulario.
- A tela interna de Agenda ganhou botao para voltar ao Calendario.
- O Culto operacional passa a respeitar o evento selecionado vindo do Calendario.
- O atalho do Culto deixou de apontar para Agenda e passou a apontar para Calendario.

## Escopo intencional desta fase

Esta fase ainda usa a tela interna de Agenda como editor transicional. A diferenca e que o usuario agora chega nela pelo Calendario com o evento correto selecionado.

Ainda nao foi implementado nesta fase:

- transformar o formulario de Agenda em modal ou drawer dentro do Calendario;
- mover toda a lista de eventos para baixo do Calendario;
- remover tecnicamente a view `events`;
- abrir Escalas/Musicas/Liturgia ja filtradas pelo mesmo contexto.

## Arquivos alterados

- `apps/web/src/CalendarPage.tsx`
- `apps/web/src/EventsPage.tsx`
- `apps/web/src/ServiceOpsPage.tsx`
- `apps/web/src/main.tsx`
- `docs/phases/phase-98-calendar-contextual-actions.md`
- `docs/decisions/0098-calendar-contextual-actions.md`
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

Seguir para Check-in 2.0 ou fazer mais um corte curto de Calendario:

- lista completa de eventos/agendas abaixo do Calendario;
- confirmacao visual mais clara para exclusao;
- abertura contextual de Escalas/Musicas/Liturgia pelo Culto.
