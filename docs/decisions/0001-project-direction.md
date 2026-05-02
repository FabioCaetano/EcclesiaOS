# Decisao 0001: Direcao Inicial Do EcclesiaOS

## Status

Aceita inicialmente.

## Contexto

Existe um projeto B1Admin neste workspace que oferece uma base rica de inspiracao para um sistema de gestao de igreja. No entanto, ele depende das APIs ChurchApps/B1 e foi desenhado para um escopo mais amplo do que o desejado agora.

## Decisao

Criar um novo projeto chamado EcclesiaOS, mantendo o B1Admin como referencia consultavel.

O EcclesiaOS tera APIs proprias e sera desenvolvido por fases. A primeira modelagem assume uma igreja especifica, nao uma plataforma multi-tenant completa.

## Consequencias

- Ganhamos controle total sobre dominio, banco e API.
- Evitamos carregar complexidade desnecessaria no inicio.
- Precisamos documentar bem cada decisao para nao perder coerencia.
- Funcionalidades do B1Admin so entram no EcclesiaOS apos validacao explicita.
