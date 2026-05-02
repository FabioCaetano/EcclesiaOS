# Decisao 0043: UX Inicial, Inicio, Agenda E Check-in

## Status

Aceita.

## Contexto

A tela Inicio antiga ainda explicava principios do projeto e modulos, mas o produto ja evoluiu para operacao real. Tambem ficou claro que Check-in, Agenda, Ambientes e transmissao precisam conversar melhor para o usuario entender o fluxo.

## Decisao

Transformar Inicio em painel operacional, permitir configurar canal do YouTube no cadastro da igreja, sugerir Ambientes como locais de Agenda, armazenar expressao cron textual em Eventos e separar Check-in em abas internas sem criar novo item no menu lateral.

## Consequencias

- O usuario entra em uma tela mais util para operacao diaria.
- O cadastro da igreja passa a guardar a origem do canal de transmissao.
- Agenda fica mais alinhada com Ambientes.
- Cron fica preparado no modelo antes da geracao automatica de ocorrencias.
- Check-in passa a distinguir evento, kids e administracao kids.

## Nao Objetivos

- Nao integrar API oficial do YouTube nesta fase.
- Nao gerar ocorrencias cron automaticamente nesta fase.
- Nao criar envio real de mensagens por provedor externo.
- Nao remodelar Escalas nesta fase.
- Nao criar mensagens em lote em Pessoas nesta fase.
