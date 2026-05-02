# Fase 43: YouTube Real Sem Chave Oficial

## Objetivo

Substituir o embed de playlist na tela Inicio por uma listagem real dos ultimos videos do canal da igreja, sem depender da API oficial do YouTube e sem exigir chave do Google Cloud.

## Status

Concluida.

## Escopo

- Endpoint `GET /youtube/videos` na API.
- Modulo de YouTube no backend com:
  - extracao de `channelId` a partir de URLs `/channel/UC...`;
  - resolucao de `channelId` a partir de URLs `/@handle`, `/c/handle` e `/user/handle`;
  - leitura do feed RSS publico do canal;
  - parsing de titulo, id do video, link, data de publicacao e thumbnail;
  - cache em memoria por URL com TTL de 10 minutos.
- Tipo `YouTubeVideo` em `packages/shared`.
- Atualizacao da tela Inicio para chamar o endpoint e renderizar cards (thumbnail + titulo + data + link).
- Mensagem amigavel quando o canal nao esta configurado, quando a resolucao falha ou quando o feed esta vazio.

## Fora De Escopo

- Uso da YouTube Data API v3.
- Badge de live em tempo real.
- Listagem de playlists alem da de uploads.
- Persistencia de cache em banco.
- Migracao de schema.

## Criterios De Aceite

- Com `youtubeChannelUrl` no formato `/channel/UC...`, a tela Inicio exibe os ultimos videos.
- Com `youtubeChannelUrl` no formato `/@handle` ou `/c/handle`, a tela Inicio tambem exibe os ultimos videos.
- Sem `youtubeChannelUrl`, a tela Inicio exibe a mensagem original orientando configurar o canal.
- Quando o YouTube responde erro ou o canal nao tem videos, a tela Inicio exibe um aviso amigavel sem quebrar o painel.

## Verificacao

```powershell
npm.cmd run build --workspace @ecclesiaos/shared
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

E chamadas reais:

```text
GET http://localhost:4000/youtube/videos
```

## Proxima Pergunta

Depois desta fase, a proxima pergunta sera:

> Vamos materializar a expressao cron em ocorrencias reais na agenda (Fase 44)?
