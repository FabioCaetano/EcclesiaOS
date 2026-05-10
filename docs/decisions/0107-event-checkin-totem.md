# Decisao 0107 - Totem De Check-in De Eventos

## Contexto

O EcclesiaOS ja possuia inscricoes publicas de eventos, ingresso com QR Code e check-in administrativo dentro da Agenda. O fluxo funcionava, mas a tela de Agenda misturava configuracao do evento com operacao do dia.

## Decisao

Criar uma rota autenticada especifica para o dia do evento: `/event-totem/:eventId`.

Essa rota usa os mesmos contratos existentes de inscricao e o endpoint atual `PATCH /event-registrations/:id/checkin`, evitando nova modelagem de banco nesta fase.

## Consequencias

- A operacao de entrada fica mais limpa e focada.
- A Agenda continua sendo tela administrativa.
- QR Code e check-in manual reaproveitam a seguranca existente do `ticketCode`.
- Relatorios historicos ainda ficam para uma etapa futura.
