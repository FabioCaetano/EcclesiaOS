# Decisao 0119: Popup De Acoes No Calendario

## Status

Aceita.

## Contexto

O CalendarPage hoje mostra pills de eventos e reservas nos dias do mes. Clicar numa pill so seleciona o dia — as acoes (Abrir Culto / Editar / Excluir) ficam num painel separado abaixo, exigindo um segundo clique. O backlog do usuario pede que **clicar diretamente no evento abra um menu de acoes**, removendo o passo intermediario e deixando o calendario como entrada principal do dia-a-dia.

Tres opcoes foram consideradas:

1. **Modal centralizado**: muito interruptivo para uma acao tao rapida.
2. **Painel lateral**: ocupa espaco demais e e excessivo para 3 botoes.
3. **Popover flutuante posicionado proximo ao pin clicado**: leve, contextual, fechado ao clicar fora. **Escolhido.**

## Decisao

- Adicionar estado `activeItemId` no `CalendarPage`. Click numa pill (grid mensal) ou no item da lista do dia define esse id.
- Renderizar um popover absoluto perto do item com:
  - Para `event`: **Abrir Culto** (vai para `serviceOps` com aquele `eventId`), **Editar agenda** (visivel se `canEditEvent`), **Excluir agenda** (visivel se admin).
  - Para `reservation`: **Abrir Ambientes**.
- ESC e click fora fecham o popover.
- Reaproveitar `canEditEvent` da Fase 116 e `leadsAnyGroup` para liberar o botao "+ Novo evento/agenda" para lideres que lideram pelo menos um grupo (alinha com a fase de permissao de eventos).
- Remover os tres `icon-button` da lista do dia — substituidos por um unico clique que abre o popover (mesmo do grid).
- Sem mudancas em backend, banco ou tipos compartilhados.

## Consequencias

- Calendario fica mais proximo do comportamento de Google Calendar / Outlook.
- Cobre os 3 fluxos mais comuns sem sair da tela.
- Lideres podem criar eventos pelo calendario consistente com a Fase 116.
- Painel inferior continua disponivel como visao agregada do dia (nao removido).

## Nao Objetivos

- Drag-and-drop para mudar data do evento.
- Edicao inline (campos rapidos no popover).
- Adicionar reservas via popover.
- Multiplas selecoes.
- Atalhos de teclado alem de ESC.
