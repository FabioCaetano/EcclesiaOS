# 0078 - Resumo de preparo dentro da Agenda

## Contexto

Depois de separar Musicas e Liturgia em areas proprias, a Agenda precisava mostrar o estado de preparo de cada culto/evento sem obrigar o usuario a abrir todas as abas.

## Decisao

Adicionar um painel de resumo no evento selecionado da Agenda, usando os vinculos existentes por `eventId`.

## Motivos

- Evita criar dados duplicados.
- Mantem cada area com sua responsabilidade.
- Torna a Agenda o ponto central de leitura do preparo do culto.

## Consequencias

- A primeira versao mostra resumo, mas ainda nao navega diretamente para edicao nas outras abas.
- O proximo passo natural e uma visao operacional unica do culto.
