# Decisao 0063: Confirmacao De Email No Registro Publico De Eventos

## Status

Aceita.

## Contexto

A Fase 28 (Inscricoes De Eventos) e a Fase 38 (QR Code e check-in) entregaram o caminho completo do registro publico ao check-in. Entradas de teste/spam ainda passam livremente porque o sistema confia no email digitado. Para eventos com vagas escassas (retiro, banquete), uma inscricao com email errado significa cadeira vazia.

## Decisao

Permitir que o admin marque eventos individualmente para exigir confirmacao de email antes da vaga ser de fato confirmada.

- Novo campo no evento: `registrationRequiresEmailConfirmation: boolean` (default `false` — mantem comportamento atual).
- Novo status de inscricao: `pending_email_confirmation`.
- Inscricao publica em evento que exige confirmacao:
  - status inicial `pending_email_confirmation`;
  - gera token (`randomBytes(32)` base64url) e armazena hash sha256 + `expiresAt` (24h) no proprio `EventRegistration`;
  - dispara email de confirmacao via Resend com link `${WEB_BASE_URL}/register/<slug>/confirm?token=...`.
- Quando provedor de email nao esta configurado, o backend pula a confirmacao e segue o comportamento original (status `confirmed`/`pending_payment`); admin precisa configurar Resend antes de habilitar a flag.
- Endpoint publico `POST /public/event-registrations/confirm`:
  - recebe `{ token }`, valida hash e expiracao;
  - promove status para `confirmed` (ou `pending_payment` quando o evento tem preco);
  - apaga o token (`emailConfirmationTokenHash` -> "") e zera expiracao.
- Capacidade:
  - `pending_email_confirmation` ainda nao expirado conta como vaga reservada (segura o lugar enquanto o visitante confirma);
  - registros expirados sao tratados como `cancelled` no calculo (cleanup lazy). Nao precisamos reescrever o registro nesse momento — fica no historico.
- Audit: confirmacao registra `update event_registration` com summary "Email confirmado" usando o primeiro admin como ator (endpoint publico).

### Frontend

- EventsPage ganha checkbox "Exigir confirmacao de email" no formulario de inscricoes; aparece desabilitada (com aviso) quando o provedor de email nao esta configurado.
- Lista de inscricoes mostra novo badge "Aguardando email" com cor warning.
- Nova rota publica `/register/<slug>/confirm?token=...` que faz POST automatico ao montar e mostra resultado (sucesso, expirado, ja usado).

### Banco

- Tres novos campos em `EventRegistrationRecord`: `emailConfirmationTokenHash` (string), `emailConfirmationExpiresAt` (string ISO ou ""), `requiresEmailConfirmation` opcional (no historico do registro). Vou armazenar apenas `tokenHash` e `expiresAt`; o status carrega o estado.
- Um novo campo em `EventRecord`: `registrationRequiresEmailConfirmation: boolean`.

## Consequencias

- Inscricoes com email errado caem fora automaticamente em 24h.
- Reduz drasticamente spam em eventos com vaga escassa.
- Mantem retrocompatibilidade — flag nova, default falso, nada quebra.
- Sem nova tabela, nova coluna em registros existentes; reaproveita pattern do reset de senha.

## Nao Objetivos

- Confirmacao de email para inscricoes presenciais.
- Verificacao de telefone/SMS.
- Reenvio automatico de email de confirmacao apos expirar (operador pode mandar mensagem manual ou pessoa pode se inscrever de novo).
- Captcha ou rate limit no endpoint publico.
- Domain validation/MX check de email.
