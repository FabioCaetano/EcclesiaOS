# Fase 1: Fundacao Tecnica

## Objetivo

Criar a base tecnica minima do EcclesiaOS sem implementar ainda modulos de negocio.

## Status

Implementada.

## Escopo

- Estrutura de monorepo.
- Frontend administrativo inicial.
- API propria inicial.
- Pacote compartilhado para tipos/contratos.
- Scripts basicos de desenvolvimento.
- Documentacao de execucao.

## Fora De Escopo

- Login.
- Banco de dados.
- Pessoas.
- Grupos.
- Financeiro.
- Presenca.
- Multi-campus.
- App mobile.

## Criterios De Aceite

- A pasta do projeto possui `package.json` raiz. Concluido.
- O frontend tem uma tela inicial EcclesiaOS. Concluido.
- A API possui endpoint `/health`. Concluido.
- Existe um tipo compartilhado entre web e API. Concluido.
- Existe documentacao explicando como instalar e executar. Concluido.

## Verificacao

- `npm.cmd install`: concluido.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build`: concluido fora do sandbox por bloqueio `spawn EPERM` do Vite/esbuild no ambiente restrito.

## Pergunta Para A Proxima Fase

Depois desta fundacao, a proxima pergunta sera:

> Queremos desenvolver autenticacao e usuarios agora? O sistema tera apenas administradores internos ou membros tambem farao login?
