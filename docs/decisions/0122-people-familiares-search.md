# Decisao 0122: Familiares Pesquisaveis Em Pessoas

## Status

Aceita.

## Contexto

A pagina Pessoas (`PeoplePage`) hoje exibe "Responsaveis vinculados" como uma fieldset com checkbox de todas as pessoas da igreja. Em igrejas medias/grandes isso vira uma lista enorme e dificulta achar quem vincular. O nome "Responsaveis" tambem nao reflete o uso real — a relacao e familiar (pais, filhos, conjuges, irmaos) e usada para Check-in Kids e visitas.

Sobre visibilidade da aba: `canAccessModule("people")` no `@ecclesiaos/shared` ja restringe a aba a admin e lider. Membros nao veem a opcao no menu. **Esse pedido ja esta cumprido** e nao requer mudanca.

## Decisao

Sem migration. Sem mudar contrato compartilhado. Apenas frontend.

- Renomear visualmente todas as referencias de "Responsaveis vinculados" para **"Familiares"**, mantendo o campo do contrato como `guardianPersonIds`.
- Substituir o fieldset `member-picker` (checkbox de todas as pessoas) por:
  - **chips removiveis** dos familiares ja vinculados;
  - **input com `<datalist>`** para pesquisar pessoa pelo nome e adicionar.
- Reaproveitar `forms-chip` e `forms-chip-remove` (das Fases 115/120) para visual consistente.
- Pessoa que esta sendo editada (`selectedPersonId`) e filtrada da lista de candidatos para nao se auto-vincular.

## Consequencias

- Familiares de uma pessoa cabem como uma lista pequena e clara (varios chips), em vez de um checkbox-grid gigante.
- Busca por nome funciona em qualquer tamanho de igreja.
- Backend, banco e contrato compartilhado nao mudam.
- Nomenclatura passa a refletir o uso real ("Familiares" em vez de "Responsaveis vinculados").

## Nao Objetivos

- Tipo de relacao (pai/mae/irmao/conjuge) — fica como string livre de futuro.
- Bidirecional automatica (adicionar A em B nao adiciona B em A) — pode virar fase futura.
- Filtros por familia.
- Importacao de familias em lote.
- Renomear o campo do contrato (`guardianPersonIds`).
