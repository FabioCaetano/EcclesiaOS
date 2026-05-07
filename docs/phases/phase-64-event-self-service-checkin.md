# Fase 64 - Check-in Self-Service De Eventos

## Objetivo

Permitir que participantes de eventos facam check-in por uma tela publica de tablet/celular, lendo o QR Code do ingresso ou colando o payload manualmente.

## Entregue

- Nova pagina publica `/event-checkin/<slug>`.
- Novo endpoint publico `POST /public/event-registrations/checkin`.
- Novo contrato `EventRegistrationSelfCheckInRequest`.
- Validacao do QR `ecclesiaos-event-ticket:<id>:<ticketCode>`.
- Validacao de pertencimento do ingresso ao evento pelo `eventSlug`.
- Reuso da regra existente: apenas inscricoes `confirmed` fazem check-in.
- Campo `checkedInByUserId` recebe `self_service`.
- Auditoria tecnica usando o primeiro admin como ator.
- Link de check-in exibido na tela Agenda junto do link de inscricao.
- Teste HTTP cobrindo check-in publico e rejeicao de ingresso em evento errado.

## Regras

- O self-service usa a mesma regra de ingresso do check-in administrativo.
- O endpoint publico nao aceita apenas `id`; ele exige payload completo do ingresso.
- Se o ingresso pertencer a outro evento, retorna `403`.
- Se a inscricao estiver pendente de pagamento ou email, retorna `403`.
- A camera precisa de HTTPS ou localhost, seguindo a regra do navegador.

## Arquivos Alterados

- `packages/shared/src/index.ts`
- `apps/api/src/server.ts`
- `apps/api/src/http.test.ts`
- `apps/web/src/api.ts`
- `apps/web/src/main.tsx`
- `apps/web/src/PublicEventCheckInPage.tsx`
- `apps/web/src/EventsPage.tsx`
- `apps/web/src/styles.css`
- `docs/index.md`
- `docs/project-status.md`
- `docs/development.md`
- `docs/decision-log.md`
- `docs/next-steps.md`
- `docs/product-vision.md`

## Proximo Caminho Recomendado

**Mensagens Em Lote Com Historico De Campanha**.

O modulo de mensagens ja envia e usa templates com variaveis. O proximo ganho e registrar campanhas, status por destinatario e permitir reenvio para falhas.
