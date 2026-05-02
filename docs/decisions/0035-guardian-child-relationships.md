# Decisao 0035: Responsaveis E Criancas

## Status

Aceita.

## Contexto

O check-in infantil ja permitia vincular a crianca e o responsavel a pessoas cadastradas no momento do check-in, mas essa relacao era operacional e nao permanente. Para cultos recorrentes, a igreja precisa configurar previamente quais responsaveis estao ligados a cada crianca.

## Decisao

Armazenar em cada pessoa uma lista `guardianPersonIds`, permitindo que uma crianca tenha um ou mais responsaveis cadastrados. A tela Pessoas passa a editar esse vinculo e o check-in infantil usa a informacao para sugerir o responsavel.

## Consequencias

- A relacao responsavel/crianca deixa de depender apenas do check-in do dia.
- Criancas podem existir como pessoas sem usuario proprio.
- Responsaveis podem ter usuario para realizar operacoes futuras.
- Check-in infantil fica mais rapido em cultos recorrentes.
- O modelo ainda nao cria uma entidade separada de familia/casa.

## Nao Objetivos

- Nao obrigar toda pessoa a ter responsavel.
- Nao criar login automatico para criancas.
- Nao criar permissao de retirada publica nesta fase.
- Nao criar QR Code ou validacao externa nesta fase.
