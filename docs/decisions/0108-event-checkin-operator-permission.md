# Decisao 0108 - Permissao Operacional Do Totem Evento

## Contexto

O Totem Evento criado na Fase 107 separou a operacao de entrada da administracao da Agenda. Porem, os endpoints de inscricoes ainda exigiam permissao administrativa de eventos, limitando o uso pratico do totem.

## Decisao

Criar uma guarda operacional para eventos, permitindo `admin` e `leader` apenas nas acoes necessarias ao totem:

- listar inscricoes;
- registrar check-in por ingresso.

As demais acoes permanecem administrativas.

## Consequencias

- Lideres podem operar a entrada no dia do evento.
- O risco de edicao indevida da Agenda fica reduzido.
- O modelo ainda e simples: nao ha operadores por evento nesta etapa.
- Uma fase futura pode permitir operadores designados por evento ou por grupo/ministerio.
