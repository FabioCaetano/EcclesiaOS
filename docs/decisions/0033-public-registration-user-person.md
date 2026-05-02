# Decisao 0033: Registro Publico E Vinculo Usuario/Pessoa

## Status

Aceita.

## Contexto

Para o check-in infantil evoluir, responsaveis precisam poder ter usuario para registrar ou retirar criancas. Ao mesmo tempo, criancas nao precisam necessariamente ter usuario. A base correta e separar Pessoa de Usuario, mantendo Usuario sempre vinculado a Pessoa.

## Decisao

Todo usuario deve ter uma pessoa vinculada. Pessoas podem existir sem usuario.

O cadastro publico cria uma pessoa e um usuario de papel `member`. O status da pessoa pode ser `member` ou `visitor`. Depois, o admin pode alterar o papel do usuario para `leader` ou `admin`.

## Consequencias

- Responsaveis podem ter login.
- Criancas podem existir apenas como pessoas.
- O check-in infantil pode evoluir para responsavel logado.
- O cadastro publico nao concede papel elevado.
- Admin continua responsavel por promover usuarios.
- Seeds passam a validar vinculo usuario/pessoa.

## Nao Objetivos

- Nao criar familias ainda.
- Nao criar relacao responsavel/crianca ainda.
- Nao criar aprovacao de cadastro.
- Nao criar recuperacao de senha.
