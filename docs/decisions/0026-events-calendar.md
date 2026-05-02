# Decisao 0026: Agenda E Eventos

## Status

Aceita.

## Contexto

Depois de usuarios, senha segura e auditoria inicial, o proximo modulo funcional escolhido foi Agenda/Eventos.

O objetivo inicial nao e criar inscricoes nem check-in, mas sim ter uma base de eventos reutilizavel para presenca, escalas e comunicacao futuras.

## Decisao

Criar um modulo inicial de agenda com eventos simples.

Campos iniciais:

- titulo;
- tipo;
- data;
- horario de inicio;
- horario de fim;
- local;
- grupo vinculado opcional;
- descricao.

## Consequencias

- PostgreSQL ganhou a tabela `EventRecord`.
- JSON local ganhou `events`.
- Admin pode criar, editar e remover eventos.
- Usuarios autenticados podem listar eventos.
- Alteracoes em eventos geram auditoria.

## Nao Objetivos

- Nao criar inscricoes nesta fase.
- Nao ligar presenca diretamente ao evento ainda.
- Nao criar recorrencia de eventos.
- Nao criar calendario visual mensal.
