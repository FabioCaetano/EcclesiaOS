# Fase 63 - Reenvio De Confirmacao De Inscricao Em Eventos

## Objetivo

Fechar a lacuna operacional da confirmacao de email em inscricoes de eventos, permitindo que um administrador reenviie ou renove o link quando o inscrito nao recebeu o email ou deixou o token expirar.

## Entregue

- Novo endpoint protegido `POST /event-registrations/:id/resend-confirmation`.
- Novo contrato `EventRegistrationResendConfirmationResponse`.
- Metodo `resendEmailConfirmation` no repositorio de inscricoes.
- Renovacao de token com `randomBytes(32)` + hash sha256 e nova expiracao de 24 horas.
- Envio de email reaproveitando o mesmo template da inscricao inicial.
- Resposta explicita `emailSent` para diferenciar envio real de ambiente sem provedor configurado.
- Auditoria do reenvio.
- EventsPage com filtro `Aguardando email`, indicacao visual de link expirado e botao `Reenviar email`/`Renovar email`.
- Teste HTTP cobrindo renovacao de confirmacao pendente sem provedor de email.

## Regras

- Apenas usuarios com permissao de gerenciamento de Eventos podem reenviar.
- Apenas inscricoes em `pending_email_confirmation` podem receber novo link.
- Inscricoes sem email retornam erro de validacao.
- O endpoint renova o token mesmo quando o provedor de email nao esta configurado, mas retorna `emailSent: false`.
- O token antigo deixa de funcionar porque o hash armazenado e substituido.

## Arquivos Alterados

- `packages/shared/src/index.ts`
- `apps/api/src/data/eventRegistrationRepository.ts`
- `apps/api/src/server.ts`
- `apps/api/src/http.test.ts`
- `apps/web/src/api.ts`
- `apps/web/src/EventsPage.tsx`
- `docs/index.md`
- `docs/project-status.md`
- `docs/development.md`
- `docs/decision-log.md`
- `docs/next-steps.md`

## Proximo Caminho Recomendado

**Check-in Self-Service**.

Com inscricoes, ingresso, QR Code, confirmacao e reenvio fechados, o proximo ganho natural e permitir check-in por tablet/QR para reduzir dependencia de operador em eventos e cultos.
