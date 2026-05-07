# Fase 62: Confirmacao De Email No Registro Publico De Eventos

## Objetivo

Reduzir inscricoes spam/erro em eventos publicos exigindo, opcionalmente por evento, que o visitante clique em um link de confirmacao no email antes da vaga ser confirmada.

## Status

Concluida.

## Escopo

### Shared

- `EventRegistrationStatus` ganha `pending_email_confirmation`.
- `ChurchEvent` ganha `registrationRequiresEmailConfirmation: boolean`.
- `EventRegistration` ganha `emailConfirmationTokenHash: string` e `emailConfirmationExpiresAt: string`.
- Tipo `EventRegistrationConfirmInput { token: string }`.

### Backend

- `eventRegistrationRepository.create`:
  - quando `event.registrationRequiresEmailConfirmation` e provedor de email configurado, cria com status `pending_email_confirmation` + token + 24h;
  - caso contrario, mantem comportamento atual.
- Capacidade ignora registros expirados de `pending_email_confirmation`.
- `findPublicEvent` retorna o evento normal; `handleGetPublicEvent` calcula `reservedQuantity` excluindo expirados.
- Email enviado via Resend com link para `/register/<slug>/confirm?token=...`.
- Endpoint `POST /public/event-registrations/confirm` valida token e promove status.
- Audit log `update event_registration` com summary "Email confirmado".
- Schema Prisma + migration adicionando `requiresEmailConfirmation` em `EventRecord` e `emailConfirmationTokenHash`/`emailConfirmationExpiresAt` em `EventRegistrationRecord`.

### Frontend

- EventsPage: checkbox "Exigir confirmacao de email" no card de inscricoes (desabilitado se Resend nao configurado).
- Lista de inscricoes: badge "Aguardando email" para `pending_email_confirmation`.
- `PublicRegistrationPage` mostra mensagem clara quando registro fica em `pending_email_confirmation`.
- Nova rota `/register/<slug>/confirm` que dispara o endpoint automaticamente.

## Fora De Escopo

- Reenvio automatico apos expiracao.
- Captcha/rate limit.
- Verificacao MX/domain.
- SMS.

## Criterios De Aceite

- Evento com flag desligada continua confirmando inscricao imediatamente.
- Evento com flag ligada cria inscricao em `pending_email_confirmation`.
- POST `/public/event-registrations/confirm` com token valido promove status.
- Token expirado retorna erro 400; nao reabre vaga sozinho mas deixa de contar na capacidade do evento.
- Inscricao em `pending_email_confirmation` aparece na lista admin com badge.
- Sem provedor de email configurado, flag aparece desabilitada e o backend ignora a flag (comportamento atual).

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Manual: criar evento com inscricao + flag de confirmacao; abrir `/register/<slug>` e cadastrar; abrir email, clicar no link, ver status mudar.

## Proxima Pergunta

Sequencia inicial concluida. Proximas opcoes ainda em aberto:

> Reenvio automatico de confirmacao expirada, mensagens em lote com resposta consolidada ou check-in self-service?
