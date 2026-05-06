# Fase 51: Troca De Senha Pelo Usuario E Reset Administrativo

## Objetivo

Permitir que cada usuario troque a propria senha sem depender do admin e dar ao admin um fluxo rapido de reset com geracao de senha temporaria.

## Status

Concluida.

## Escopo

### Backend

- Endpoint `POST /auth/change-password` (autenticado).
- Endpoint `POST /users/:id/reset-password` (admin only).
- Validacao: senha minimo 6 caracteres, diferente da atual.
- Hash scrypt das senhas novas.
- Audit log nas duas operacoes.

### Frontend

- Tipos `ChangePasswordRequest` e `ResetPasswordResponse` em `packages/shared`.
- Funcoes `changeOwnPassword` e `resetUserPassword` em `apps/web/src/api.ts`.
- Nova tela `AccountPage` com formulario de troca de senha.
- AppLayout: pill de usuario no header vira link para a nova tela.
- UsersPage: botao "Resetar senha" por linha que exibe a senha temporaria gerada.

### Tests

- Teste HTTP da troca de senha pelo proprio usuario.
- Teste HTTP da rejeicao quando senha atual esta errada.
- Teste HTTP do reset administrativo (admin permitido, membro proibido).

## Fora De Escopo

- Reset por email (ainda nao temos provedor de email).
- Expiracao da senha temporaria.
- Forcar troca obrigatoria no proximo login.
- 2FA.
- Politica avancada de senha.

## Criterios De Aceite

- Usuario logado consegue trocar a propria senha informando senha atual.
- Senha errada na troca propria retorna 401.
- Senha nova com menos de 6 caracteres retorna 400.
- Admin consegue resetar senha de qualquer usuario e recebe a nova senha em texto puro uma vez.
- Membro/lider tentando reset de outro usuario recebe 403.
- Apos reset administrativo, login com a nova senha funciona.
- Audit log mostra os dois eventos.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

## Proxima Pergunta

Depois desta fase:

> Mensagens em lote em Pessoas, fluxo "esqueci minha senha" por email, ou substituto automatico para escalas recusadas?
