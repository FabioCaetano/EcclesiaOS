# Decisao 0006: Cadastro Minimo De Pessoas

## Status

Aceita para a Fase 5.

## Contexto

Depois de criar autenticacao, persistencia inicial e cadastro da igreja, o proximo modulo funcional e Pessoas. Para evitar um cadastro pesado antes de entender o uso real, a primeira versao deve ser pequena.

## Decisao

O cadastro inicial de pessoas tera:

- nome obrigatorio;
- email;
- telefone;
- data de nascimento opcional;
- status `member` ou `visitor`;
- observacoes internas.

## Consequencias

- Podemos iniciar busca/listagem sem discutir todos os campos pastorais agora.
- Campos como familia, endereco, batismo, membresia formal, LGPD e historico entram depois.
- A persistencia continua no arquivo local de desenvolvimento.
