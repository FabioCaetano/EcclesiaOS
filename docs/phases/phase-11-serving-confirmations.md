# Fase 11: Confirmacao De Escala

## Objetivo

Adicionar status de confirmacao em pessoas escaladas nos planos de servico.

## Escopo

- Atualizar contrato compartilhado de atribuicao de escala.
- Atualizar seed local.
- Atualizar normalizacao da API.
- Atualizar pagina Escalas para editar status.
- Manter permissao atual: admin altera, lider/membro visualiza.

## Fora De Escopo

- Notificacoes.
- Confirmacao pelo membro.
- Links externos.
- Email.
- WhatsApp/SMS.
- Disponibilidade e bloqueios.

## Criterios De Aceite

- Cada pessoa escalada possui status.
- Admin consegue editar o status.
- Lider e membro conseguem visualizar o status.
- Nenhum endpoint novo e necessario.

## Verificacao

- `npm.cmd run build --workspace @ecclesiaos/shared`: concluido.
- `npm.cmd run typecheck`: concluido.

Build completo e validacao de endpoints reais permanecem pendentes enquanto houver bloqueio de execucao elevada no ambiente.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos criar testes automatizados ou seguir para Financeiro?
