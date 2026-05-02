# Decisao 0040: Impressao Em Lote De Etiquetas Infantis

## Status

Aceita.

## Contexto

A etiqueta infantil ja existia com formato Brother, codigo de seguranca e QR Code. O fluxo ainda exigia abrir uma etiqueta por vez, o que e lento para cultos com varias criancas chegando no mesmo periodo.

## Decisao

Adicionar selecao em lote na lista de check-ins infantis e gerar etiquetas sequenciais usando o mesmo formato Brother. O frontend controla o modo de impressao para evitar misturar etiqueta individual e lote.

## Consequencias

- A equipe infantil imprime varias etiquetas de uma vez.
- O fluxo continua usando o dialogo de impressao do navegador e o driver Brother.
- Nao ha mudanca no banco nem na API.
- Impressao silenciosa ou SDK Brother ficam para fase futura.

## Nao Objetivos

- Nao integrar SDK Brother.
- Nao criar impressao automatica sem confirmacao.
- Nao criar historico de reimpressao.
- Nao alterar o check-in infantil no backend.
