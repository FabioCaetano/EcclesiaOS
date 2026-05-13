# Fase 121: Aba Etiquetas Dedicada

## Objetivo

Separar a configuracao de templates de etiqueta e impressoras da aba Igreja, criando uma view dedicada no grupo Sistema, admin-only.

## Status

Concluida.

## Escopo

### Shared

- `packages/shared/src/index.ts`:
  - `AppModuleKey` ganha `"labels"`;
  - `canAccessModule("labels")` → admin;
  - `canManageModule("labels")` → admin.

### Frontend

- `apps/web/src/types.ts`: `AppView` ganha `"labels"`.
- `apps/web/src/LabelsPage.tsx` novo: extracao integral do bloco "Etiquetas e impressoras" do `ChurchPage`, incluindo:
  - `LabelTemplate[]`, CRUD (`saveLabelTemplate`, `deleteLabelTemplate`);
  - formulario `LabelTemplateInput`;
  - render do teste de impressao com `@page` dinamico;
  - lista de templates por layout;
- `apps/web/src/AppLayout.tsx`: nova entrada `{ label: "Etiquetas", module: "labels", view: "labels", icon: Tag, group: "Sistema" }`.
- `apps/web/src/main.tsx`: roteamento `currentView === "labels" && <LabelsPage ... />`.
- `apps/web/src/ChurchPage.tsx`:
  - remover imports nao usados (`Tag`, `Printer`, `Plus` se nao tiver mais uso);
  - remover state e handlers de template;
  - remover Card "Templates de etiqueta";
  - remover bloco `printingTemplate` print area.

### Backend / Shared / Banco

- Nenhuma mudanca. Endpoints `/label-templates` permanecem.

## Fora De Escopo

- Preview interativo da etiqueta.
- Suporte a impressoras nao-Brother.
- Layouts personalizados.
- Aplicar etiquetas em outros modulos.

## Criterios De Aceite

- Menu lateral mostra "Etiquetas" para admin no grupo Sistema; nao aparece para lider/membro.
- Clicar abre `LabelsPage` com a mesma UX de antes (lista de templates + form + teste de impressao).
- `ChurchPage` nao mostra mais o bloco de etiquetas.
- Build e typecheck passam.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run build:web
```

Manual: logar como admin, abrir Etiquetas, criar template, imprimir teste, conferir que a aba Igreja nao mostra mais o bloco; logar como lider e confirmar que Etiquetas nao aparece no menu.

## Proxima Pergunta

Depois desta fase:

> Item 9: Pessoas com Familiares pesquisaveis + esconder de membro.
