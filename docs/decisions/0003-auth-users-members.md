# Decisao 0003: Usuarios Administrativos E Membros

## Status

Aceita.

## Contexto

Na Fase 2, precisamos definir quem tera conta no EcclesiaOS. A resposta do responsavel do projeto foi que membros tambem terao login, nao apenas administradores e lideres internos.

## Decisao

O EcclesiaOS deve suportar, desde a modelagem inicial, contas para:

- administradores;
- lideres;
- membros.

## Consequencias

- O modelo de usuario precisa separar identidade de permissao.
- O sistema deve preparar experiencias diferentes por papel.
- A area administrativa continua protegida, mas a existencia de membros com login passa a ser uma premissa.
- O controle de acesso deve impedir que uma conta de membro veja areas administrativas.

## Implementacao Inicial

Nesta fase, a autenticacao sera funcional, mas simples:

- usuarios semente em memoria;
- login por email e senha;
- token assinado pela API;
- endpoint para obter o usuario atual;
- protecao basica da tela web.

Persistencia em banco, recuperacao de senha e convite de usuario entram em fases posteriores.
