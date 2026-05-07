# 0076 - Base de musicas e repertorios

## Contexto

Foi solicitada uma area de musicas para cadastrar cancoes, tons e playlists por culto, com visualizacao das musicas relacionadas ao culto.

## Decisao

Criar um modulo proprio `Musicas`, separado de `Escalas`, com duas entidades iniciais:

- `Song`: biblioteca de musicas.
- `WorshipSet`: repertorio/playlists por culto ou evento.

## Motivos

- A biblioteca de musicas pode ser reutilizada em varios cultos.
- O repertorio pertence a uma data/culto especifico.
- Mantem a evolucao futura aberta para liturgia, anexos, cifras por tom e integracao com escala de louvor.

## Consequencias

- A primeira versao ainda nao edita detalhes por item de repertorio em linha.
- A tela de Agenda ainda nao exibe o repertorio embutido.
- As proximas fases podem conectar repertorio, liturgia e escala de louvor.
