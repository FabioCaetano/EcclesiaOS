# Decisao 0020: Verificacao Runtime Do Prisma

## Status

Aceita para a Fase 19.

## Contexto

O projeto ja possui schema, migration e provider Prisma. Faltava um comando simples para confirmar que a API consegue ler dados reais pelo provider `prisma`.

## Decisao

Adicionar `npm run db:verify`, que executa a API compilada e tenta ler os dados pelo provider Prisma.

## Consequencias

- A verificacao deixa claro quando o Postgres nao esta acessivel.
- O comando nao depende de `tsx` em runtime; ele compila e roda com `node`.
- A estabilizacao do banco fica reproduzivel quando Docker/Postgres estiver ativo.

## Nao Objetivos

- Nao substituir testes automatizados.
- Nao criar banco remoto.
- Nao iniciar Docker Desktop automaticamente.
