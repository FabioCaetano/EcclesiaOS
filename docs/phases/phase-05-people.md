# Fase 5: Pessoas

## Objetivo

Criar o primeiro cadastro funcional de pessoas do EcclesiaOS.

## Status

Implementada.

## Escopo

- Contratos compartilhados de pessoa.
- Persistencia local de pessoas.
- Endpoint para listar pessoas.
- Endpoint para criar pessoa.
- Endpoint para atualizar pessoa.
- Endpoint para remover pessoa.
- Tela simples de listagem e formulario.

## Fora De Escopo

- Familias/casas.
- Endereco por pessoa.
- Notas separadas com historico.
- Merge de duplicados.
- Importacao.
- Permissoes granulares.
- LGPD.

## Criterios De Aceite

- A API lista pessoas. Concluido.
- Um admin consegue criar pessoa. Concluido.
- Um admin consegue editar pessoa. Concluido.
- Um admin consegue remover pessoa. Concluido.
- Lider e membro conseguem visualizar a lista. Concluido.
- Lider e membro nao conseguem alterar pessoas. Concluido.

## Verificacao

- `npm.cmd run reset-dev-data`: concluido.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build`: concluido.
- `GET /people`: concluido.
- `POST /people` com admin: concluido.
- `PUT /people/:id` com admin: concluido.
- `DELETE /people/:id` com admin: concluido.
- `GET /people` com membro: concluido.
- `POST /people` bloqueado para membro: concluido com `403`.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos evoluir Pessoas com familias/casas ou seguir para Grupos e Ministerios?
