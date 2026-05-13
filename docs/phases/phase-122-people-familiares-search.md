# Fase 122: Familiares Pesquisaveis Em Pessoas

## Objetivo

Trocar o checkbox-grid de "Responsaveis vinculados" por chips + busca via `<datalist>` e atualizar a nomenclatura para "Familiares". Membros ja nao veem a aba (verificado em `canAccessModule("people")`).

## Status

Concluida.

## Escopo

### Frontend

- `apps/web/src/PeoplePage.tsx`:
  - renomear "Responsaveis vinculados" → "Familiares" (legend, descricao da pagina, placeholders);
  - substituir `member-picker` por chips removiveis;
  - novo input com `<datalist id="people-familiares-options">` populado por todas as pessoas exceto a selecionada;
  - botao "Adicionar" (ou Enter) confirma; pessoa fora da lista mostra mensagem clara;
  - chip com `forms-chip-remove` para tirar familiar.
- `apps/web/src/styles.css`:
  - novo bloco `.people-familiares` com lista de chips e input de busca, reaproveitando `.forms-chip` e `.forms-people-input`.

### Backend / Shared / Banco

- Nenhuma mudanca. `guardianPersonIds: string[]` no contrato permanece.

## Fora De Escopo

- Tipo de relacao (pai/mae/irmao/conjuge).
- Vinculacao bidirecional automatica.
- Filtros por familia.
- Importacao em lote.

## Criterios De Aceite

- Pagina Pessoas mostra "Familiares" em vez de "Responsaveis vinculados".
- Pessoas vinculadas aparecem como chips com X.
- Buscar por nome (digitar + Enter ou Adicionar) acrescenta a pessoa.
- Pessoa atualmente em edicao nao aparece como sugestao (sem auto-vincular).
- Pessoa inexistente exibe mensagem.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run build:web
```

Manual: como admin, abrir pessoa "Maria"; digitar "Joao" no campo Familiares; ver chip aparecer; remover com X; salvar; reabrir e conferir.

## Proxima Pergunta

Depois desta fase:

> Item 17: Mover Indisponibilidade para fora de Minha conta.
