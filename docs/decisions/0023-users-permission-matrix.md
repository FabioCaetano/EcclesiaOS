# Decisao 0023: Usuarios E Matriz Inicial De Permissoes

## Status

Aceita.

## Contexto

Depois de validar PostgreSQL/Prisma e os usuarios semente, o proximo gargalo era administrar usuarios reais sem editar seed ou banco manualmente.

Tambem era necessario parar de espalhar regras isoladas como `role === "admin"` pela interface.

## Decisao

Criar uma matriz inicial compartilhada de acesso por modulo e criar gestao administrativa de usuarios.

Nesta fase:

- `finance` e `users` sao modulos visiveis apenas para `admin`;
- usuarios sao listados sem expor senha;
- admin pode criar, editar e remover usuarios;
- admin nao pode remover o proprio usuario;
- senha em branco na edicao preserva a senha atual.

## Consequencias

- A interface passa a ter a aba `Usuarios` para administradores.
- A API passa a expor CRUD inicial em `/users`.
- O pacote `shared` passa a centralizar `canAccessModule`.
- Ainda nao ha papel separado de tesouraria.

## Nao Objetivos

- Nao implementar hash de senha nesta fase.
- Nao criar recuperacao de senha.
- Nao criar roles customizadas.
- Nao criar auditoria ainda.
