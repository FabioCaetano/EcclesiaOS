# Decisao 0008: Layout E Navegacao Antes De Mais Dominios

## Status

Aceita para a Fase 7.

## Contexto

A aplicacao web ja possui login, cadastro da igreja, pessoas e grupos. Tudo ainda esta concentrado em uma tela unica, o que aumenta a complexidade do arquivo principal e dificulta a entrada de novos modulos.

## Decisao

Antes de adicionar Presenca, Financeiro ou outros dominios, criar uma fase de layout e navegacao.

## Consequencias

- O frontend passa a ter areas navegaveis.
- O arquivo principal fica menor e mais facil de manter.
- Novos modulos entram como paginas, nao como mais secoes na mesma tela.
- O comportamento da API e os dados atuais devem ser preservados.

## Nao Objetivos

- Nao criar um redesign completo.
- Nao adicionar dominio novo.
- Nao trocar a stack de UI.
- Nao alterar regras de permissao.
