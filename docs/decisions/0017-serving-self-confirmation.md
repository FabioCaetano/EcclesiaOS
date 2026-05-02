# Decisao 0017: Confirmacao Propria De Escalas

## Status

Aceita para a Fase 16.

## Contexto

As escalas ja possuiam status por pessoa, mas apenas administradores alteravam esse status. Para aproximar o fluxo da operacao real da igreja, membros e lideres precisam responder suas proprias escalas.

## Decisao

Vincular usuarios a pessoas por `personId` e permitir que um usuario autenticado confirme ou recuse apenas atribuicoes de escala ligadas a sua propria pessoa.

Administradores continuam podendo alterar qualquer atribuicao.

## Consequencias

- `CurrentUser` passa a carregar `personId`.
- Seeds de usuarios apontam para pessoas existentes quando aplicavel.
- A API ganha endpoint especifico para resposta de atribuicao.
- Notificacoes internas iniciais mostram pendencias de escala.

## Nao Objetivos

- Nao enviar email real.
- Nao enviar WhatsApp/SMS.
- Nao criar agenda completa de disponibilidade.
- Nao abrir link publico de resposta.
