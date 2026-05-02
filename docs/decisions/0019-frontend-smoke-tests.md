# Decisao 0019: Smoke Tests Do Frontend Com Playwright

## Status

Aceita para a Fase 18.

## Contexto

O EcclesiaOS ja possui muitos fluxos navegaveis. Depois dos testes de API, a proxima protecao necessaria e garantir que a interface autenticada abre, faz login e navega pelas telas principais.

## Decisao

Adicionar Playwright para smoke tests do frontend.

## Consequencias

- A suite sobe API e frontend em portas isoladas.
- O teste usa banco JSON E2E separado.
- O fluxo de login admin e navegacao principal passa a ser automatizado.
- Testes visuais pixel-perfect continuam fora do escopo.

## Nao Objetivos

- Nao cobrir todos os formularios.
- Nao testar todos os navegadores.
- Nao fazer comparacao visual por screenshot.
- Nao substituir testes manuais de UX.
