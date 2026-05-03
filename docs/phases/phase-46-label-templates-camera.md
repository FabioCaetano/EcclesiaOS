# Fase 46: Templates De Etiqueta E Camera QR Universal

## Objetivo

Resolver dois problemas operacionais: a camera de QR Code que nao abre em navegadores sem `BarcodeDetector` e a impossibilidade de configurar a impressora Brother da igreja sem alterar codigo. Criar um cadastro de templates de etiqueta com tamanho, modelo de impressora, layout e padrao por layout.

## Status

Concluida.

## Escopo

### Camera QR universal

- Adicionar `jsqr` como decoder de fallback.
- Extrair logica de scanner em hook `useQrScanner` reutilizado.
- Trocar `facingMode: "environment"` por `facingMode: { ideal: "environment" }`.
- Mensagens de diagnostico amigaveis: sem suporte, permissao negada, sem cameras.
- Aplicar em Check-in (admin kids) e Agenda (validacao de ingresso).

### Templates de etiqueta

- Tipo `LabelTemplate` em `packages/shared` com layout `kids_checkin` ou `visitor`.
- Migration Prisma criando `LabelTemplateRecord` com indice unico parcial `(layout)` quando `isDefault = true`.
- Repositorio `labelTemplateRepository` com `list`, `listByLayout`, `create`, `update`, `remove`.
- Endpoints `/label-templates` (GET autenticado, POST/PUT/DELETE admin).
- Seed inicial: dois templates `kids_checkin` (Brother DK-1202 62x100 e Brother 62mm continuo) com o primeiro como padrao + um template `visitor` exemplo.
- Secao "Etiquetas" no cadastro da igreja com CRUD e botao "Imprimir teste" por template.
- Check-in carrega templates `kids_checkin` da API e usa o `isDefault` como pre-selecao; mantem os dois fallbacks fixos quando a API falha.
- Tela Pessoas ganha botao "Imprimir etiqueta de visitante" que usa o template `visitor` padrao.

## Fora De Escopo

- Designer visual de etiqueta (drag-and-drop).
- PDFs gerados pelo backend.
- Layouts de evento, membro, batizando ou outros (ficam para fases futuras).
- Gateway de impressao direto (LPR/IPP).
- Configuracoes por usuario; templates sao da igreja.

## Criterios De Aceite

- Camera abre em Firefox e Chrome em desktop e mobile (com permissao concedida).
- Quando a camera falha, a mensagem na tela explica o motivo (permissao, sem camera, sem suporte) ao inves de "indisponivel".
- Admin consegue criar, editar, definir como padrao e remover templates de etiqueta na nova secao Etiquetas.
- Marcar um template como padrao desmarca os outros do mesmo layout.
- Botao "Imprimir teste" abre dialogo do navegador com a etiqueta de exemplo no tamanho correto.
- Tela Check-in lista os templates `kids_checkin` cadastrados e usa o padrao na pre-selecao.
- Pessoas tem acao "Imprimir etiqueta de visitante" usando o template `visitor` padrao.
- Sem login admin, GET /label-templates ainda funciona (qualquer autenticado le); POST/PUT/DELETE retornam 403 para nao-admin.

## Verificacao

```powershell
npm.cmd run build --workspace @ecclesiaos/shared
npm.cmd run db:generate
npm.cmd run typecheck
npm.cmd run db:migrate:deploy
npm.cmd run reset-dev-data
npm.cmd run db:verify
npm.cmd run test
npm.cmd run build
```

## Proxima Pergunta

Depois desta fase:

> Vamos seguir para Mensagens em lote em Pessoas, Troca/Reset de senha ou Substituto automatico para escalas recusadas?
