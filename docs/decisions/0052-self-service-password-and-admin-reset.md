# Decisao 0052: Troca De Senha Pelo Usuario E Reset Administrativo

## Status

Aceita.

## Contexto

Hoje so o admin troca senhas, atraves do CRUD de usuarios. Nao existe:

- troca da propria senha pelo usuario logado;
- reset rapido pelo admin que gere uma senha temporaria sem precisar inventar uma;
- "esqueci minha senha" via email.

E um risco de producao: se o usuario quer trocar a senha, o admin precisa intervir e digitar uma senha nova manualmente.

## Decisao

Implementar nesta fase os dois primeiros fluxos. O reset por email fica para fase futura (precisa de provedor de email e tokens com expiracao).

### Self-service: o usuario troca a propria senha

- Endpoint `POST /auth/change-password` (autenticado).
- Body: `{ currentPassword, newPassword }`.
- Backend valida `currentPassword` contra o hash atual; se valido, hashing scrypt do `newPassword` substitui.
- `newPassword` exige no minimo 6 caracteres e diferente do atual.
- Audit log registra `update` em `user` com summary `Senha alterada pelo proprio usuario`.

### Reset administrativo: admin gera senha temporaria

- Endpoint `POST /users/:id/reset-password` (admin only).
- Backend gera 12 caracteres alfanumericos cripto-seguros.
- Resposta retorna a senha temporaria uma unica vez (em texto puro).
- Backend ja persistiu o hash; a senha em texto so existe no payload de resposta.
- Audit log registra `update` em `user` com summary `Senha redefinida pelo admin`.

### UI

- AppLayout: o pill de usuario no header vira um link para a tela "Minha conta".
- Nova rota interna `account` com formulario simples de troca de senha.
- UsersPage: cada linha de usuario ganha botao "Resetar senha" que abre confirm, faz a chamada e exibe a senha gerada em destaque para o admin copiar.

## Consequencias

- Usuarios passam a poder alterar a propria senha sem depender do admin.
- Admin tem fluxo de reset rapido, especialmente util quando alguem esquece a senha.
- Senhas em texto puro nunca sao persistidas; sao expostas apenas no payload de reset (uma vez).
- Sem provedor de email ainda; o admin compartilha a senha temporaria com o usuario por canal apropriado.

## Nao Objetivos

- Nao implementar fluxo de "esqueci minha senha" por email.
- Nao expirar a senha temporaria automaticamente.
- Nao forcar o usuario a trocar a senha temporaria no proximo login (ainda).
- Nao implementar 2FA.
- Nao implementar politica avancada de senha (complexidade, historico, etc.).
