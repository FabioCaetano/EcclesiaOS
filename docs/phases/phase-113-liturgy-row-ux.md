# Fase 113: UX Da Liturgia Em Linhas

## Objetivo

Reduzir a friccao de planejar liturgia: linhas compactas em vez de cards expandidos, responsavel pesquisavel, e separacao clara entre planejar e executar.

## Status

Concluida.

## Escopo

### Frontend

- `apps/web/src/LiturgyPage.tsx`:
  - subir "Notas da liturgia" para acima da lista de itens;
  - cabecalho unico (`Hora | Item | Responsavel | Notas | acoes`) acima das linhas;
  - cada item da liturgia vira `liturgy-item-row` com grid horizontal;
  - remover o checkbox "Concluido" do editor;
  - responsavel passa a usar `<input list="...">` + `<datalist>` com mapeamento texto -> personId;
  - "Remover item" vira icone `Trash2` no final da linha.
- `apps/web/src/styles.css`:
  - novo bloco `.liturgy-items-table`, `.liturgy-items-header`, `.liturgy-item-row` com grid e responsividade basica.

### Backend / Shared

- Nenhuma mudanca. `ServiceChecklistItem.completed` continua existindo no tipo e na API; a UX deixa de expor edicao na criacao mas o campo se mantem `false` para itens novos.

## Fora De Escopo

- Modo execucao com cronometro.
- Drag-and-drop para reordenar.
- Templates de liturgia reaproveitaveis.
- Multiplos responsaveis por item.

## Criterios De Aceite

- Liturgia com 10 itens cabe na tela com menos rolagem que antes.
- Digitar parte do nome no campo Responsavel filtra sugestoes nativas.
- Itens novos salvam com `completed: false` sem opcao manual no editor.
- Notas da liturgia aparecem acima da lista.
- Botao "X" remove a linha correspondente.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run build:web
```

Manual: abrir uma liturgia existente, adicionar 3 itens novos, pesquisar responsavel pelo nome parcial, remover um item pelo X, salvar, recarregar e conferir.

## Proxima Pergunta

Depois desta fase:

> Calendario de Ambientes ou builder de Formularios estilo Google Forms?
