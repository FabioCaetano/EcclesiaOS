# 0065 - Check-in Self-Service De Eventos

## Decisao

Eventos com inscricao publica passam a ter um link publico de check-in self-service em `/event-checkin/<slug>`.

## Contexto

O sistema ja tinha ingresso com QR Code e check-in administrativo. Para eventos com fluxo alto, a igreja pode querer deixar um tablet/celular na entrada para o proprio participante validar o ingresso.

## Consequencias

- O backend expoe `POST /public/event-registrations/checkin`.
- O request exige `ticketPayload` e `eventSlug`.
- O payload precisa seguir `ecclesiaos-event-ticket:<id>:<ticketCode>`.
- O ingresso precisa pertencer ao evento do slug informado.
- O check-in grava `checkedInByUserId = "self_service"`.
- O self-service respeita status: somente `confirmed` entra.
- A Agenda mostra o link de self-service para o administrador copiar.

## Fora Do Escopo

- Busca por email/telefone sem QR.
- Totem autenticado por PIN.
- Check-in self-service infantil.
- Modo offline.
- Rate limit dedicado.
