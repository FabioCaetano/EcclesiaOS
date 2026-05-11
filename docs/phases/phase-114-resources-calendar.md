# Fase 114: Calendario De Ambientes

## Objetivo

Dar a operadores e lideres uma visao mensal de uso das salas, com pillls coloridas por ambiente, atalho para criar reserva no dia clicado e abertura direta do editor ao clicar numa reserva existente.

## Status

Concluida.

## Escopo

### Frontend

- `apps/web/src/ResourcesPage.tsx`:
  - terceira aba `Calendario` ao lado de `Cadastro de ambientes` e `Reservas`;
  - grid mensal 7 colunas com dias do mes selecionado mais buffer cinza dos meses adjacentes;
  - pills de reserva (max. 3 por dia + `+N`), com cor derivada de hash do `resourceId`;
  - filtro por ambiente; clicar em pill leva para a aba `Reservas` com editor aberto na reserva;
  - clicar em dia vazio abre nova reserva pre-preenchendo `date` e `resourceId`;
  - reservas `cancelled` aparecem com opacidade reduzida.
- Trocar `user.role !== "admin"` por `canManageModule(user.role, "resources")` em todo `ResourcesPage`.
- `apps/web/src/styles.css`:
  - novo bloco `.resources-calendar-grid`, `.resources-calendar-day`, `.resources-calendar-pill` com responsividade.

### Backend / Shared

- Nenhuma mudanca. Backend ja permite lider em `resources` (via `canManageModule`); bloqueio de conflito ja funciona.

## Fora De Escopo

- Visao semanal/diaria.
- Drag-and-drop de reservas no calendario.
- Export iCal.
- Notificacao automatica.

## Criterios De Aceite

- A aba Calendario mostra um grid mensal alinhado a semana (Dom a Sab).
- Pills de reservas aparecem nos dias com reserva e usam cor por ambiente.
- Clicar em pill leva para a aba Reservas com aquela reserva selecionada.
- Clicar em dia vazio abre nova reserva pre-preenchida.
- Lider consegue editar/criar/remover reservas e ambientes via UI.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run build:web
```

Manual: criar duas reservas em ambientes diferentes no mesmo mes, ver pills coloridas, clicar em uma para abrir editor, clicar em dia vazio para criar nova, confirmar mensagem de conflito ao agendar sobreposto.

## Proxima Pergunta

Depois desta fase:

> Builder de Formularios estilo Google Forms ou permissao por grupo/ministerio responsavel para eventos?
