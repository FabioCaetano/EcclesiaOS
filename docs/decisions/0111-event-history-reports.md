# Decisao 0111 - Relatorios Historicos De Eventos

## Contexto

O Totem Evento gera CSV e impressao do evento atual. Ainda faltava uma visao historica dentro da aba Relatorios, onde administradores podem recortar eventos por periodo e status.

## Decisao

Criar o relatorio historico no frontend usando `events` e `event-registrations`, com filtros client-side e exportacao CSV do recorte filtrado.

## Consequencias

- Nao ha nova migration.
- O relatorio ja aproveita check-ins feitos pelo Totem Evento ou pela tela de Agenda.
- A aba Relatorios passa a concentrar tanto pessoas quanto eventos.
- Agregacoes mais pesadas podem virar endpoint dedicado no futuro.
