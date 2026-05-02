# Fase 7: Layout E Navegacao

## Objetivo

Organizar o frontend do EcclesiaOS em um painel navegavel, separando a tela unica atual em secoes de trabalho.

## Status

Implementada.

## Escopo

- Criar layout autenticado.
- Criar navegacao principal.
- Separar areas: Inicio, Igreja, Pessoas e Grupos.
- Mover logica de formularios para componentes menores.
- Preservar login, sessoes e permissoes atuais.

## Fora De Escopo

- Presenca.
- Financeiro.
- Banco relacional.
- Redesign completo.
- Rotas com React Router.
- Testes E2E.

## Criterios De Aceite

- O usuario autenticado ve navegacao principal. Concluido.
- O usuario consegue alternar entre Inicio, Igreja, Pessoas e Grupos. Concluido.
- O login continua funcionando. Concluido.
- Admin continua podendo editar igreja, pessoas e grupos. Concluido.
- Lider e membro continuam apenas visualizando. Concluido.
- `apps/web/src/main.tsx` deixa de concentrar todas as telas. Concluido.

## Verificacao

- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build`: concluido.
- carregar `http://localhost:5173`: concluido com status `200`.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos seguir para Presenca ou aprofundar Grupos com calendario e comunicacao?
