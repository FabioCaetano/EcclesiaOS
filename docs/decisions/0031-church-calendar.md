# Decisao 0031: Calendario Visual Da Igreja

## Status

Aceita.

## Contexto

Eventos, inscricoes e reservas de ambientes ja existem como dominios separados. A necessidade seguinte e ter uma visao unica da agenda da igreja para entender ocupacao de dias, cultos, encontros e uso de ambientes.

## Decisao

Criar uma primeira tela de `Calendario` no frontend, consolidando dados existentes sem criar endpoint novo.

A tela mensal combina eventos e reservas, mantendo Agenda e Ambientes como locais de edicao dos registros.

## Consequencias

- A primeira versao fica simples e reaproveita APIs ja existentes.
- O calendario nasce como uma visao de consulta.
- Edicoes continuam nos modulos de origem.
- Admin ve contagem de inscricoes em eventos quando disponivel.
- Lider e membro nao dependem da rota administrativa de inscricoes.
- Um endpoint agregado podera ser criado depois se a tela ganhar filtros avancados.

## Nao Objetivos

- Nao editar eventos ou reservas direto no calendario.
- Nao criar drag and drop.
- Nao criar recorrencia expandida.
- Nao integrar Google Calendar/iCal ainda.
- Nao substituir Agenda ou Ambientes.
