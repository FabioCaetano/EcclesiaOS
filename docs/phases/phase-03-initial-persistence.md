# Fase 3: Persistencia Inicial

## Objetivo

Persistir usuarios de desenvolvimento fora da memoria da API, preparando a troca futura para banco relacional.

## Status

Implementada.

## Escopo

- Criar arquivo local de dados de desenvolvimento.
- Criar repositorio de usuarios na API.
- Adaptar login para buscar usuarios no repositorio.
- Criar script de seed/reset dos dados locais.
- Documentar o fluxo.

## Fora De Escopo

- PostgreSQL.
- Prisma.
- Cadastro real de usuarios.
- Edicao de usuarios.
- Recuperacao de senha.
- Cadastro da igreja.

## Criterios De Aceite

- A API carrega usuarios a partir de arquivo local. Concluido.
- O login continua funcionando para admin, lider e membro. Concluido.
- `/auth/me` continua validando o token. Concluido.
- Existe script para resetar os dados de desenvolvimento. Concluido.
- A documentacao explica onde ficam os dados locais. Concluido.

## Verificacao

- `npm.cmd run reset-dev-data`: concluido fora do sandbox por bloqueio `tsx/esbuild` com `spawn EPERM`.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build`: concluido.
- `POST /auth/login` com admin: concluido.
- `POST /auth/login` com lider: concluido.
- `POST /auth/login` com membro: concluido.
- `GET /auth/me` com os tokens retornados: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos modelar o cadastro da igreja agora? Ela sera uma igreja unica simples ou ja teremos campus/locais?
