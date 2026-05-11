# Fase 115: Builder De Formularios

## Objetivo

Tornar a edicao de formularios na pagina Formularios mais densa, escalavel e proxima do Google Forms, sem mudar backend nem contrato.

## Status

Concluida.

## Escopo

### Frontend

- `apps/web/src/FormsPage.tsx`:
  - cada campo do builder vira `forms-field-row` em grid horizontal `[label] [tipo] [obrigatorio] [↑] [↓] [X]`;
  - quando `type === "select"`, abaixo aparece `forms-field-options` com chips editaveis (`<input>` por opcao, botao `+`, X por opcao);
  - botoes ↑ e ↓ reordenam o array `fields` e renumeram `order`;
  - responsaveis pesquisaveis com `<input list="forms-people-options">` + `<datalist>`; chips removiveis dos selecionados;
  - card `Preview do publico` colapsavel renderizando cada `CustomFormField` com o input apropriado;
  - bloco `Configuracoes` colapsavel agrupando slug, link publico, lista textual de responsaveis;
  - mensagem ao usuario quando tenta marcar opcoes em tipo diferente de `select`.
- `apps/web/src/styles.css`:
  - novo bloco `.forms-builder`, `.forms-field-row`, `.forms-field-options`, `.forms-chip`, `.forms-people-chips`, `.forms-preview`, `.collapsible-card`.

### Backend / Shared

- Nenhuma mudanca. `CustomFormField.options: string[]` continua o contrato; o builder apenas para de serializar/desserializar via CSV.

## Fora De Escopo

- Drag-and-drop para reordenar campos.
- Tipos de campo novos (radio, escala, arquivo).
- Logica condicional.
- Templates de formulario.
- Editor multipaginas/secoes.

## Criterios De Aceite

- Formulario com 8 campos cabe sem rolagem significativa.
- Botoes ↑/↓ movem o campo na lista; o primeiro fica sem ↑, o ultimo sem ↓.
- Opcoes de `select` viram lista de chips editaveis; adicionar e remover funciona; salvar persiste.
- Responsaveis pesquisaveis funcionam com 100+ pessoas; chips refletem os selecionados.
- Preview mostra o formulario com inputs do tipo correto, igual ao publico.
- Configuracoes (slug + link publico) ficam recolhidas por padrao.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run build:web
```

Manual: criar formulario novo com 6 campos variados, alterar ordem, marcar `select` e editar opcoes, atribuir responsaveis, abrir preview, salvar, abrir link publico para conferir.

## Proxima Pergunta

Depois desta fase:

> Permissao por grupo/ministerio responsavel para eventos ou WhatsApp em lote real?
