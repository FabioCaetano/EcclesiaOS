# Fase 119: Popup De Acoes No Calendario

## Objetivo

Permitir que o usuario abra um menu contextual diretamente sobre o evento clicado no calendario para Abrir Culto, Editar ou Excluir, sem precisar de um segundo passo.

## Status

Concluida.

## Escopo

### Frontend

- `apps/web/src/CalendarPage.tsx`:
  - novo state `activeItemId` (string vazia quando fechado);
  - click numa pill (grid) ou item da lista do dia abre o popover sobre aquele item;
  - popover absoluto via wrapper `position: relative` no item; ESC e click fora fecham;
  - itens de evento ganham acoes **Abrir Culto**, **Editar agenda** (`canEditEvent`), **Excluir agenda** (admin);
  - itens de reserva ganham acao **Abrir Ambientes**;
  - lista do dia substitui os 3 `icon-button` por um unico botao que abre o popover (mesmo grid);
  - botao "+ Novo evento/agenda" no PageHeader visivel para admin OU lider que lidera ao menos um grupo;
  - importar `canEditEvent` e `leadsAnyGroup` do `@ecclesiaos/shared`.
- `apps/web/src/styles.css`:
  - novo bloco `.calendar-popover` com sombra, padding, animacao de fade.

### Backend / Shared

- Nenhuma mudanca. Reaproveita helpers da Fase 116.

## Fora De Escopo

- Drag-and-drop para mover evento.
- Edicao inline no popover.
- Criar reserva pelo popover.
- Multiplas selecoes.

## Criterios De Aceite

- Clicar num pin do calendario abre o popover proximo ao evento.
- Popover oferece Abrir/Editar/Excluir conforme permissao.
- ESC fecha; click fora fecha.
- Reservation mostra apenas Abrir Ambientes.
- Botao "+ Novo evento/agenda" funciona para lider que lidera algum grupo.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run build:web
```

Manual: logar como lider de grupo, abrir Calendario, clicar num evento existente, ver popover; testar Abrir Culto, Editar, Excluir; logar como membro e confirmar que o popover so mostra Abrir Culto.

## Proxima Pergunta

Depois desta fase:

> Item 10 (Grupos com Posicoes), item 3 (Escala — diagnostico), ou item 12 (mover Etiquetas para fora da aba Igreja)?
