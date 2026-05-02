# Fase 22: Usuarios E Matriz Inicial De Permissoes

## Objetivo

Permitir administrar usuarios pela interface e centralizar a primeira matriz de permissao por modulo.

## Status

Implementada.

## Escopo

- Criar tipos `UserInput`, `AppModuleKey` e `canAccessModule` em `packages/shared`.
- Criar CRUD inicial de usuarios na API:
  - `GET /users`;
  - `POST /users`;
  - `PUT /users/:id`;
  - `DELETE /users/:id`.
- Bloquear `/users` para lider e membro.
- Manter senhas fora da resposta da API.
- Criar tela `Usuarios` no frontend.
- Ocultar `Financeiro` e `Usuarios` de perfis nao admin.
- Cobrir regras principais em testes HTTP.

## Fora De Escopo

- Hash de senha.
- Recuperacao ou troca propria de senha.
- Perfil de tesouraria.
- Auditoria.
- Convites por email.

## Criterios De Aceite

- Admin acessa a aba Usuarios.
- Lider e membro nao veem a aba Usuarios.
- Admin lista usuarios sem senha.
- Admin cria usuario com senha inicial.
- Usuario criado consegue logar.
- Admin edita perfil e pessoa vinculada.
- Admin remove outro usuario.
- Admin nao remove o proprio usuario.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Resultados:

- `typecheck`: concluido.
- `test`: 11 testes API passando.
- `build`: concluido.
- `GET /users` validado contra a API local em `http://localhost:4000` usando login admin.

Pendente por limite do ambiente:

```powershell
npm.cmd run test:web
```

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos seguir para auditoria, hash de senhas, ou agenda/eventos?
