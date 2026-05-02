# Decisao 0004: Persistencia Inicial Antes Do Banco Relacional

## Status

Aceita para a proxima etapa.

## Contexto

A autenticacao da Fase 2 nasceu funcional, mas com usuarios em memoria. Antes de modelar dados da igreja, precisamos que os usuarios sobrevivam ao reinicio da API.

Ainda nao queremos introduzir uma dependencia operacional pesada, como PostgreSQL instalado localmente, antes de validar o dominio inicial.

## Decisao

Criar uma camada de repositorio na API e persistir os dados de desenvolvimento em arquivo JSON local.

Essa camada deve isolar a aplicacao do mecanismo de armazenamento para que, em uma fase posterior, possamos trocar o arquivo JSON por PostgreSQL/Prisma.

## Consequencias

- O login deixa de depender apenas de memoria.
- Os usuarios semente ficam registrados em um arquivo local.
- A API ganha um ponto claro para futura migracao ao banco relacional.
- Ainda nao ha banco relacional nesta etapa.

## Nao Objetivos

- Nao implementar Prisma ainda.
- Nao exigir PostgreSQL local ainda.
- Nao criar tela de cadastro de usuarios ainda.
- Nao criar migracoes de banco ainda.
