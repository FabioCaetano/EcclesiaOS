# 0098 - Navegacao Contextual A Partir Do Calendario

## Contexto

A Fase 97 removeu a Agenda do menu lateral e colocou as acoes principais no Calendario, mas editar ou abrir um evento ainda levava para telas genericas. Isso mantinha parte da friccao apontada no feedback: o usuario clicava em um evento especifico, mas precisava reencontrar o mesmo evento na tela seguinte.

## Decisao

Adicionar contexto de evento na navegacao principal:

- Calendario informa qual evento deve ser editado;
- Agenda interna seleciona esse evento e preenche o formulario;
- Culto operacional seleciona automaticamente o evento aberto;
- criar novo evento limpa o contexto anterior.

## Motivos

- Reduzir passos e ambiguidade na operacao.
- Aproximar o comportamento esperado: clicar em um evento deve abrir aquele evento.
- Manter a mudanca pequena, sem transformar o editor de Agenda em modal nesta fase.

## Consequencias

- O Calendario passa a coordenar parte do estado operacional do app.
- A view `events` segue existindo como editor interno transicional.
- Proximas fases podem reaproveitar o mesmo contexto para Escalas, Musicas e Liturgia.
