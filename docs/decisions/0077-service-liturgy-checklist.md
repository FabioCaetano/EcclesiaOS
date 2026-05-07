# 0077 - Liturgia como checklist vinculado ao culto

## Contexto

Foi solicitado que cada culto tenha uma checklist baseada na liturgia, utilizavel durante o culto.

## Decisao

Criar a entidade `ServiceChecklist`, vinculavel a um evento/culto, com itens ordenados e marcacao de concluido.

## Motivos

- Mantem a liturgia independente do repertorio, mas conectavel ao mesmo culto.
- Permite uso operacional durante o culto.
- Facilita evolucao para responsaveis, notificacoes e modo operador.

## Consequencias

- A primeira interface fica dentro de `Musicas`, por ser a area atual de preparo do culto.
- A Agenda ainda nao exibe a liturgia embutida.
- A proxima evolucao deve aproximar Agenda, Repertorio e Liturgia numa mesma visao de culto.
