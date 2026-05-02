# Decisao 0041: Tela De Auditoria

## Status

Aceita.

## Contexto

O backend ja registrava logs de auditoria para operacoes sensiveis, mas o acesso dependia de chamada direta ao endpoint. Era necessario disponibilizar consulta administrativa dentro do painel.

## Decisao

Criar uma tela Auditoria no frontend, restrita a admin pelo modulo `audit`, usando o endpoint existente `GET /audit-logs` e filtros client-side.

## Consequencias

- Auditoria passa a ser consultavel pelo painel.
- Permissao de auditoria fica explicita no contrato compartilhado.
- A primeira versao nao altera o banco.
- Filtros sao client-side enquanto o volume local for pequeno.

## Nao Objetivos

- Nao criar diff de campos nesta fase.
- Nao criar exportacao.
- Nao auditar leitura.
- Nao criar alertas automaticos.
