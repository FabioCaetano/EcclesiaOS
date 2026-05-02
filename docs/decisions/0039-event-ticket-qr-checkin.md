# Decisao 0039: QR Code De Ingresso E Check-in De Participantes

## Status

Aceita.

## Contexto

Inscricoes de eventos ja possuiam participantes, status manual e recibo/ingresso imprimivel. Faltava transformar o comprovante em um ingresso operacional, com codigo validavel na entrada.

## Decisao

Cada inscricao passa a ter `ticketCode` e campos de check-in. O ingresso exibe QR Code com `event_registration_id` e `ticketCode`. A tela Agenda permite ler o QR Code pela camera ou validar manualmente o payload.

## Consequencias

- Eventos passam a ter controle simples de entrada.
- Ingresso confirmado pode ser marcado como usado.
- Inscricoes pendentes ou canceladas nao entram.
- O check-in ainda e administrativo, nao publico.
- Envio de ingresso por email fica para fase futura.

## Nao Objetivos

- Nao integrar pagamento online.
- Nao criar check-in anonimo.
- Nao criar QR Code assinado com expiracao nesta fase.
- Nao criar envio automatico de ingresso.
