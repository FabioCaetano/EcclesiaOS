# 0075 - Relatorios iniciais de pessoas no frontend

## Contexto

Foi solicitada uma area de relatorios com indicadores como aniversariantes da semana, total de membros, composicao por mulheres, homens, adolescentes e kids.

## Decisao

Criar a primeira versao da aba de `Relatorios` no frontend, consolidando dados de `Pessoas` e `Grupos` ja carregados pela API.

## Motivos

- Entrega uma visao util rapidamente.
- Evita alterar o banco antes de estabilizar quais relatorios serao usados na pratica.
- Mantem a fase pequena e facil de validar.

## Consequencias

- Os relatorios dependem do carregamento completo de pessoas e grupos no navegador.
- Para bases maiores, sera necessario criar endpoints agregados no backend.
- Exportacao CSV inicial fica focada em pessoas e ministerios.
