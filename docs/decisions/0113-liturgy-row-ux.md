# Decisao 0113: UX Da Liturgia Em Linhas

## Status

Aceita.

## Contexto

A pagina de Liturgia (Fase 77) tinha cada item da ordem do culto montado como um "card editor" expandido com cinco campos rotulados verticalmente, mais um botao grande "Remover item" full-width. O resultado eram telas longas, dificil ler a ordem de uma so vez. Alem disso o `<select>` de Responsavel listava todas as pessoas da igreja em ordem nativa de `<option>`, o que nao escala para 100+ pessoas. E o checkbox "Concluido" aparecia ja na criacao, antes da liturgia rodar, induzindo o operador a confundir planejamento com execucao.

## Decisao

Refazer apenas a UX da pagina, sem mexer em backend, banco ou contrato.

- Itens da liturgia viram **linhas compactas** com grid horizontal: `[hora] [item] [responsavel] [notas] [X]`. Cabecalho aparece uma vez acima das linhas.
- Checkbox "Concluido" some do editor; itens novos nascem com `completed: false`. Marcar concluido durante o culto fica para uma fase futura com tela "modo execucao".
- Responsavel passa a usar `<input list>` + `<datalist>` (nativo HTML, leve, sem nova dependencia). O usuario digita parte do nome e o navegador sugere; mapeamos o texto digitado de volta para `responsiblePersonId` quando bate com uma pessoa.
- Remocao de item passa a ser um botao "X" / icone de lixeira pequeno ao final da linha.
- "Notas da liturgia" sobem para cima da lista de itens, em destaque.

## Consequencias

- Liturgias com 8-15 itens cabem na tela sem rolar tanto.
- Selecionar responsavel funciona com qualquer tamanho de igreja.
- Planejamento e execucao ficam visualmente separados.
- Backend, repositorio, Prisma e tipos compartilhados nao mudam.

## Nao Objetivos

- Modo execucao com timer/cronometro.
- Drag-and-drop para reordenar itens (manter botoes ou ordem por criacao).
- Templates de liturgia reaproveitaveis.
- Atribuir multiplos responsaveis no mesmo item.
