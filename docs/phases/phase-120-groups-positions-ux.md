# Fase 120: Grupos Com Posicoes E Visibilidade

## Objetivo

Tornar o cadastro de ministerios viavel: posicoes editaveis como itens, membros adicionados por busca, atribuicao de posicao clara, e visibilidade restrita aos grupos que o usuario participa (quando nao for admin).

## Status

Concluida.

## Escopo

### Frontend

- `apps/web/src/GroupsPage.tsx`:
  - filtrar `groups` por visibilidade quando `user.role !== "admin"`;
  - bloco "Posicoes" com lista de chips editaveis (`<input>` por posicao + X + botao `+ Posicao`); remover posicao tambem limpa de `memberServicePositions`;
  - bloco "Membros" com chips (cada chip e uma pessoa + toggles das posicoes daquele grupo) + input com `<datalist>` para adicionar; remover chip remove da lista de membros e zera as posicoes daquele membro;
  - label "Posicoes de servico" vira "Posicoes" para ministry/team;
  - mensagem clara quando o usuario nao e admin e nao participa de nenhum grupo.
- `apps/web/src/styles.css`:
  - novo bloco `.groups-positions`, `.group-position-chip`, `.groups-members-grid`, `.group-member-chip`, `.group-member-positions`.

### Backend / Shared

- Nenhuma mudanca. `servicePositions: string[]` e `memberServicePositions: Record<string, string[]>` continuam.

## Fora De Escopo

- Filtro server-side de `GET /groups`.
- Drag-and-drop para reordenar.
- Importacao em lote.
- Sub-grupos / hierarquia.
- Limite numerico por posicao.

## Criterios De Aceite

- Ministerios usam chips para posicoes; adicionar/remover funciona; ao salvar persiste corretamente.
- Membros sao adicionados por busca (datalist), exibidos como chips; toggles atribuem posicoes.
- Remover membro tira `memberPersonIds` e zera `memberServicePositions[personId]`.
- Remover posicao tira `servicePositions` e remove a posicao de todos os `memberServicePositions[...]`.
- Login como lider (nao admin) so ve grupos onde lidera ou e membro.
- Login como membro so ve grupos onde participa.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run build:web
```

Manual: criar ministerio "Louvor" com 5 posicoes via chips; adicionar 3 membros via busca; atribuir posicoes; salvar; recarregar e conferir; logar como membro fora do grupo e ver que a pagina some o grupo da lista.

## Proxima Pergunta

Depois desta fase:

> Item 12 (mover etiquetas para fora de Igreja).
