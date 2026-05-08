# Fase 81 - Formularios: filtros de respostas

## Objetivo

Melhorar a consulta das respostas dos formularios customizados.

## Implementado

- Busca textual nas respostas do formulario selecionado.
- Filtro por data inicial.
- Filtro por data final.
- Botao para limpar filtros.
- Contador mostrando respostas exibidas em relacao ao total.
- Exportacao CSV passa a respeitar o filtro aplicado na tela.

## Arquivos principais

- `apps/web/src/FormsPage.tsx`

## Validacao

Executado com sucesso:

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado dos testes:

- 40 testes passaram.

## Proximos passos

- Criar relatorios agregados por formulario.
- Registrar status de notificacoes enviadas.
- Melhorar o construtor de campos com reordenacao visual.
