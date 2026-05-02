# Decisao 0044: YouTube Real Sem Chave Oficial

## Status

Aceita.

## Contexto

A tela Inicio ja exibe uma area de YouTube, mas hoje monta `iframes` com `videoseries` derivados da URL `/channel/UC...`. Esse modo nao consegue mostrar lista real de videos, depende do canal expor o ID UC, nao funciona com `@handle` e nao distingue se o conteudo existe.

A igreja nao quer assumir custo nem gerenciar uma chave do Google Cloud nesta fase.

## Decisao

Adicionar um endpoint proprio `GET /youtube/videos` que:

- le `youtubeChannelUrl` do cadastro da igreja;
- aceita URLs `/channel/UC...`, `/@handle`, `/c/handle` e `/user/handle`;
- quando recebe handle, resolve o `channelId` consultando a pagina publica do canal;
- consulta o feed RSS publico `https://www.youtube.com/feeds/videos.xml?channel_id=UC...`;
- retorna a lista parseada com titulo, link, data de publicacao e thumbnail;
- mantem cache em memoria por URL com TTL de 10 minutos.

A tela Inicio passa a usar esse endpoint para renderizar cards reais (thumbnail + titulo + data + link) dos ultimos videos.

Nao usaremos a YouTube Data API v3 nesta fase. Quando aparecer necessidade real (badge de live em tempo real, busca avancada, contagem de visualizacoes), abriremos uma fase propria para integracao com chave.

## Consequencias

- Nenhuma dependencia externa nova: parsing de XML feito no proprio servidor.
- Funciona com handle moderno do YouTube (`@nome`) sem o usuario precisar saber o ID.
- Sem chave, nao temos badge confiavel de "ao vivo agora"; lives aparecem na lista de videos como qualquer outro video.
- Sem chave, eventuais bloqueios de rate limit do YouTube no IP do servidor podem afetar o feed; o cache de 10 minutos reduz o risco.
- A qualquer momento podemos trocar a fonte para a API oficial sem quebrar o frontend.

## Nao Objetivos

- Nao usar chave do Google Cloud nesta fase.
- Nao detectar status de live em tempo real.
- Nao listar playlists alem da de uploads.
- Nao persistir cache em banco; apenas memoria do processo.
