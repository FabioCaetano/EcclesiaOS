# Decisao 0015: Testes HTTP Da API

## Status

Aceita para a Fase 14.

## Contexto

A Fase 13 criou testes de repositorios. O proximo risco e garantir que os endpoints reais respeitam autenticacao, permissoes e contratos basicos.

## Decisao

Separar a criacao do servidor HTTP em `createEcclesiaServer()` e testar a API em memoria com porta dinamica.

## Consequencias

- Os testes HTTP nao precisam de servidor externo rodando.
- O comando `npm run test` valida repositorios e endpoints.
- O modo normal de iniciar a API continua funcionando.
- Os testes continuam usando arquivo temporario via `ECCLESIAOS_DATA_FILE`.

## Nao Objetivos

- Nao testar frontend nesta fase.
- Nao adicionar Playwright.
- Nao testar todos os endpoints em profundidade ainda.
- Nao substituir testes manuais de UX.
