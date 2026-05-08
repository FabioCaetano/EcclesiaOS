# 0080 - Notificacao e exportacao de formularios

## Contexto

Depois da criação dos formularios customizados, era necessario avisar responsaveis sobre novas respostas e permitir exportar dados.

## Decisao

Adicionar email best-effort aos responsaveis e exportacao CSV no frontend, sem criar novas tabelas nesta etapa.

## Motivos

- Reutiliza a configuração de email existente.
- Evita bloquear o envio publico caso o email falhe.
- Entrega exportacao util sem complexidade adicional no backend.

## Consequencias

- O sistema ainda nao registra historico de entrega por resposta.
- CSV e gerado no navegador a partir das respostas carregadas.
