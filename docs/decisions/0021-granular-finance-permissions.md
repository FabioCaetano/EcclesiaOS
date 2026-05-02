# Decisao 0021: Permissao Granular Inicial Do Financeiro

## Status

Aceita para a Fase 20.

## Contexto

O Financeiro contem dados sensiveis. Ate a Fase 19, a leitura de lancamentos estava disponivel para qualquer usuario autenticado, enquanto criacao, edicao e remocao ja eram restritas a admin.

## Decisao

Restringir a listagem de lancamentos financeiros a usuarios `admin`.

A interface tambem deve ocultar a navegacao para Financeiro quando o usuario nao for admin.

## Consequencias

- Lideres e membros deixam de acessar dados financeiros pela API.
- A barra lateral passa a refletir a permissao real do backend.
- Testes HTTP passam a cobrir a regra de leitura financeira.

## Nao Objetivos

- Nao criar papeis customizados nesta fase.
- Nao criar perfil especifico de tesouraria nesta fase.
- Nao criar matriz completa de permissoes ainda.
