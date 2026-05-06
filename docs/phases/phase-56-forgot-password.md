# Fase 56: Reset De Senha Por Email

## Objetivo

Permitir que o usuario esquecido recupere acesso sozinho atraves de link enviado por email, usando o provedor configurado na Fase 55.

## Status

Concluida.

## Escopo

### Backend

- Tipos `RequestPasswordResetInput`, `ResetPasswordInput` em `packages/shared`.
- Migration Prisma criando `PasswordResetTokenRecord`.
- `passwordResetTokenRepository` (create, findByTokenHash, markUsed, removeForUser).
- Endpoints publicos:
  - `POST /auth/request-password-reset`
  - `POST /auth/reset-password`
- Token `randomBytes(32)` em base64url, sha256 antes de armazenar, expira em 15 min, uso unico.
- Envio de email com `sendEmail` quando provedor configurado; resposta sempre 200 generica para nao vazar existencia de usuario.
- Variavel `WEB_BASE_URL` no backend (padrao `http://localhost:5173`).
- Audit log na redefinicao.

### Frontend

- Roteamento em `main.tsx` reconhece `/forgot-password` e `/reset-password`.
- `ForgotPasswordPage`: form com email + mensagem generica de sucesso.
- `ResetPasswordPage`: form com nova senha + confirmacao; redireciona para login em sucesso.
- LoginPage: link "Esqueci minha senha".

### Tests

- Token expirado retorna erro generico.
- Token usado retorna erro generico.
- Token valido troca a senha; relogin funciona.
- Email inexistente retorna 200 (nao vaza).

## Fora De Escopo

- 2FA, perguntas de seguranca.
- Notificacao por email apos reset bem-sucedido.
- Job de limpeza de tokens expirados.
- Rate limit explicito.
- "Esqueci meu email".

## Criterios De Aceite

- LoginPage tem link "Esqueci minha senha".
- Form de email submetido retorna mensagem generica.
- Email com link e enviado quando email existe e provedor configurado.
- Link expira em 15 min.
- Reset com token valido troca a senha e marca token como usado.
- Tentar usar o mesmo token de novo retorna erro generico.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Manual: clicar "Esqueci minha senha" → digitar email cadastrado → ver email chegar → clicar link → trocar senha → fazer login com a nova.

## Proxima Pergunta

Depois desta fase:

> Notificacoes de escala por email, confirmacao de email no registro publico, ou matrix view de equipes?
