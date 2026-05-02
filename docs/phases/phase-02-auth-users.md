# Fase 2: Autenticacao E Usuarios

## Objetivo

Criar a primeira experiencia funcional de login do EcclesiaOS, considerando administradores, lideres e membros.

## Status

Implementada.

## Escopo

- Contratos compartilhados de usuario, papel, login e sessao.
- API propria com `POST /auth/login` e `GET /auth/me`.
- Token assinado pela API.
- Tela de login no frontend.
- Estado de sessao no navegador.
- Diferenciacao visual inicial por papel.

## Fora De Escopo

- Banco de dados.
- Cadastro real de usuarios.
- Recuperacao de senha.
- Convites por email.
- Permissoes granulares.
- Area de membro completa.
- Auditoria de login.

## Usuarios Semente

Ambiente inicial de desenvolvimento:

| Papel | Email | Senha |
| --- | --- | --- |
| Admin | admin@ecclesiaos.local | admin123 |
| Lider | lider@ecclesiaos.local | lider123 |
| Membro | membro@ecclesiaos.local | membro123 |

## Criterios De Aceite

- Um admin consegue fazer login. Concluido.
- Um lider consegue fazer login. Concluido.
- Um membro consegue fazer login. Concluido.
- O frontend guarda a sessao localmente. Concluido.
- O usuario atual pode sair da sessao. Concluido.
- A API valida token em `/auth/me`. Concluido.

## Verificacao

- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build`: concluido.
- `POST /auth/login` com admin: concluido.
- `POST /auth/login` com membro: concluido.
- `GET /auth/me` com token de membro: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos criar o banco de dados e persistir usuarios agora, ou desenvolver primeiro o cadastro da igreja?
