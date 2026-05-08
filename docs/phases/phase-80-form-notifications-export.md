# Fase 80 - Formularios: notificacoes e exportacao

## Objetivo

Evoluir Formularios customizados com notificacao aos responsaveis e exportacao das respostas.

## Implementado

- Envio de email best-effort aos responsaveis do formulario quando uma nova resposta publica e recebida.
- O envio depende da configuração de email existente no EcclesiaOS.
- Exportacao CSV das respostas do formulario selecionado.
- O CSV inclui data/hora de envio e uma coluna para cada campo do formulario.

## Arquivos principais

- `apps/api/src/server.ts`
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

- Registrar status de entrega de email por resposta.
- Criar filtros por periodo e busca textual nas respostas.
- Criar relatorios de formularios.
