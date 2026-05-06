# Decisao 0057: Reset De Senha Por Email

## Status

Aceita.

## Contexto

A Fase 51 entregou troca de senha pelo proprio usuario (precisa saber a senha atual) e reset administrativo (admin gera senha temporaria). Falta o caminho mais comum: o usuario esqueceu a senha e quer redefinir sem depender do admin. A Fase 55 plugou o Resend, entao agora da para enviar email transacional com link.

## Decisao

Implementar fluxo padrao de "esqueci minha senha" com link enviado por email:

### Modelo

```text
PasswordResetToken {
  id
  userId
  tokenHash    # sha256 do token bruto; armazenamos so o hash
  expiresAt    # 15 minutos apos a criacao
  usedAt       # null ate ser consumido
  createdAt
}
```

### Endpoints publicos (sem auth)

- `POST /auth/request-password-reset` recebe `{ email }`. Sempre retorna 200 com mensagem generica ("Se o email estiver cadastrado, voce recebera um link"). Nunca vaza se o email existe ou nao. Internamente, se o usuario existe e ha provedor de email, gera token aleatorio (32 bytes -> base64url, ~43 chars), salva o hash, dispara email.
- `POST /auth/reset-password` recebe `{ token, newPassword }`. Valida: token existe, nao expirou, nao foi usado, senha nova >= 6 chars. Atualiza senha do usuario, marca token como usado, registra audit log. Erros sempre retornam mensagem generica para nao distinguir token invalido de token expirado.

### Token

- Token bruto: `randomBytes(32).toString("base64url")`. URL-safe.
- Hash: `sha256(token)`. So o hash vai pro banco.
- Expira em 15 minutos.
- Uso unico (consome ao primeiro reset bem-sucedido).

### Email

- Assunto: "Recuperar acesso ao EcclesiaOS"
- Corpo (texto + HTML simples): explicacao + link "Redefinir senha" + aviso de expiracao em 15 min + linha "Se voce nao solicitou, ignore."
- URL do link: `${WEB_BASE_URL}/reset-password?token=<TOKEN>`. `WEB_BASE_URL` e nova env var; padrao em dev e `http://localhost:5173`.

### Frontend

- LoginPage ganha link "Esqueci minha senha".
- Nova rota publica `/forgot-password`: form com email; submit chama o endpoint; mostra mensagem generica de sucesso.
- Nova rota publica `/reset-password?token=...`: form com nova senha + confirmacao; submit chama o endpoint; em sucesso, redireciona para login.

## Consequencias

- Usuario consegue se recuperar sozinho, sem admin.
- Sem provedor de email (Fase 55 sem chave), o endpoint `/auth/request-password-reset` ainda responde 200, mas o email nao sai. Nesta fase, isso fica documentado — fluxo so funciona com Resend configurado.
- Token sha256 + uso unico + expiracao de 15 min cobre o caso comum de seguranca.
- Audit log registra a redefinicao bem-sucedida.

## Nao Objetivos

- Nao implementar 2FA ou perguntas de seguranca.
- Nao implementar rate limit explicito (cron-parser e Resend ja tem proprios; a Fase 51 ja contem hash scrypt).
- Nao expirar manualmente tokens antigos (job de limpeza fica para fase futura).
- Nao notificar o usuario por email apos o reset bem-sucedido.
- Nao oferecer "esqueci meu email" (fora de escopo).
