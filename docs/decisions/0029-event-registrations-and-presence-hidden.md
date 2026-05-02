# Decisao 0029: Inscricoes De Eventos E Presenca Oculta

## Status

Aceita.

## Contexto

Com check-in por evento implementado, a aba antiga de Presenca ficou menos clara para o uso operacional atual. A necessidade seguinte foi criar uma forma de registrar pessoas em eventos com limite de vagas, link publico e diferenca entre eventos gratuitos e pagos.

## Decisao

Ocultar `Presenca` da navegacao principal sem remover o dominio existente, e criar inscricoes publicas por evento usando slug publico.

Eventos podem habilitar inscricoes, definir limite de vagas, valor, moeda e slug. Inscricoes gratuitas entram como `confirmed`; inscricoes pagas entram como `pending_payment`, sem gateway nesta fase.

## Consequencias

- O menu fica mais coerente com o fluxo atual de Agenda e Check-in.
- O historico/codigo de presenca continua disponivel para reaproveitamento futuro.
- Eventos passam a ter link publico de inscricao.
- A API passa a aceitar inscricoes sem login apenas em rotas publicas especificas.
- A listagem completa de inscricoes fica restrita a quem pode gerenciar eventos.
- O sistema ainda nao confirma pagamento automaticamente.

## Nao Objetivos

- Nao remover presenca do backend.
- Nao consolidar check-ins em presenca nesta fase.
- Nao integrar pagamento online.
- Nao emitir ingresso com QR Code.
- Nao criar reservas de ambientes ainda.
