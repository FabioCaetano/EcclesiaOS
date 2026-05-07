# 0074 - Campos Ampliados Em Pessoas

## Contexto

Novos relatorios e acompanhamentos dependem de dados que ainda nao existiam no cadastro de pessoas, como membresia, batismo, endereco e genero.

## Decisao

Ampliar `PersonProfile` com campos simples e compativeis:

- `membershipDate`;
- `address`;
- `baptized`;
- `gender`.

Ministerios que a pessoa serve continuam sendo derivados de `GroupProfile.memberPersonIds` e `memberServicePositions`, evitando duplicacao entre Pessoas e Grupos.

## Consequencias

- O cadastro de Pessoas fica pronto para relatorios iniciais.
- Relatorios de aniversariantes podem usar `birthDate`.
- Relatorios por mulheres/homens usam `gender`.
- Relatorios de adolescentes/kids podem ser calculados por idade.
- Futuramente podemos normalizar endereco e batismo sem quebrar a primeira versao.

