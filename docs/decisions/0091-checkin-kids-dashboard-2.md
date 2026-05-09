# Decisao 0091 - Lotacao De Salas Como Alerta Operacional

## Contexto

Depois que as salas infantis passaram a ser configuraveis, o operador precisava enxergar rapidamente onde ha lotacao, quais criancas estao em cada sala e quais criancas ainda nao possuem sala definida.

## Decisao

Calcular ocupacao e alertas no frontend usando os check-ins infantis ativos e as capacidades cadastradas nas salas. Nesta etapa, a lotacao gera alerta visual, mas nao bloqueia o registro.

## Consequencias

- O Check-in Kids fica mais util para operacao real sem criar novas tabelas.
- O operador consegue filtrar por sala durante o culto.
- O bloqueio automatico de sala cheia fica reservado para uma etapa futura, quando definirmos excecoes e fluxo de override.
