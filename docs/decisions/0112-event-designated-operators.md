# Decisao 0112 - Operadores Designados Por Evento

## Contexto

Lideres ja podiam operar o Totem Evento, mas ainda faltava um controle mais fino para liberar uma pessoa especifica sem transformar essa pessoa em lider ou administrador global.

## Decisao

Adicionar `operatorPersonIds` diretamente em `ChurchEvent` e usar esse campo para autorizar listagem de inscricoes e check-in no Totem Evento.

## Consequencias

- A permissao passa a ser contextual por evento.
- Admin continua controlando quem opera cada evento pela Agenda.
- Operadores designados podem ser membros comuns, desde que tenham usuario vinculado a pessoa.
- A API evita expor inscricoes de outros eventos para operadores nao globais.
- Eventos recorrentes precisam copiar operadores do evento mestre para manter a operacao consistente.

