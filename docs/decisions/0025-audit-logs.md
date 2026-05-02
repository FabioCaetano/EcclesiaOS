# Decisao 0025: Auditoria Inicial

## Status

Aceita.

## Contexto

O sistema ja possui usuarios administrativos e operacoes sensiveis, como usuarios, pessoas e financeiro. Antes de ampliar o produto, precisamos registrar quem fez alteracoes importantes.

## Decisao

Criar uma tabela de auditoria e registrar eventos de criacao, edicao e remocao em dominios sensiveis.

Nesta fase inicial, a auditoria cobre:

- usuarios;
- pessoas;
- lancamentos financeiros.

## Consequencias

- PostgreSQL ganhou a tabela `AuditLogRecord`.
- JSON local ganhou o campo `auditLogs`.
- Admin pode consultar `GET /audit-logs`.
- Lider e membro nao podem consultar auditoria.
- A auditoria registra ator, acao, entidade, resumo e data.

## Nao Objetivos

- Nao criar tela de auditoria nesta fase.
- Nao registrar leitura/visualizacao.
- Nao armazenar diff completo de campos.
- Nao auditar todos os modulos ainda.
