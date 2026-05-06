# Fase 55: Provedor De Email Com Resend

## Objetivo

Adicionar envio real de email atraves do Resend e plugar isso na Mensagens em lote (Fase 53). Sem mexer em senha por email, notificacoes ou templates ricos — esses ficam para fases proprias.

## Status

Concluida.

## Escopo

### Backend

- Dependencia `resend` na API.
- Variaveis `RESEND_API_KEY` e `EMAIL_FROM`.
- `apps/api/src/email.ts` com `sendEmail({ to, subject, html, text })` e `isEmailConfigured()`.
- Quando `RESEND_API_KEY` nao esta presente, `sendEmail` registra log e retorna `{ ok: false, reason: "not_configured" }` sem lancar erro.
- `POST /people-messages`:
  - Se `channel === "email"` e provedor configurado e destinatarios tem email cadastrado, enviar via Resend.
  - Resposta passa a incluir `delivery: { sent, skipped, failed }` com contagem.
  - Quando provedor nao configurado, comportamento atual permanece (frontend abre `mailto:`).
- `GET /system/email-status` retorna `{ configured: boolean }`.

### Frontend

- `loadEmailStatus(token)` carrega o status no MessagesPage.
- Quando configurado e canal selecionado e `email`, botao "Enviar" passa a ler "Enviar via Resend" e nao abre `mailto:` no envio bem-sucedido.
- Lista de "Links abertos" so aparece quando provedor nao esta disponivel ou canal e `whatsapp`.
- Banner sutil indicando estado: "Provedor de email configurado" (verde) ou "Sem provedor; emails abrem no cliente padrao do dispositivo" (cinza).

### Deploy

- `docs/deploy.md` ganha secao explicando configuracao do Resend, variaveis e fallback.

## Fora De Escopo

- Reset de senha por email (Fase 56).
- Templates HTML.
- Webhooks de entrega.
- SMS.
- Multi-provedor.

## Criterios De Aceite

- Sem `RESEND_API_KEY`: tudo continua igual (mensagem registrada, frontend abre `mailto:`).
- Com `RESEND_API_KEY` valido: envio para destinatarios com email retorna `delivery.sent > 0`.
- Destinatarios sem email: `delivery.skipped` conta esses; nao tenta enviar.
- `GET /system/email-status` responde com `configured: false` quando sem chave.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Manual: configurar `RESEND_API_KEY` em `.env`, rodar `npm run dev:api`, enviar mensagem com canal `email`, ver email chegar.

## Proxima Pergunta

Depois desta fase:

> Reset de senha por email (Fase 56), notificacoes de escala por email, ou matrix view de equipes?
