# Fase 8: Presenca

## Objetivo

Registrar presenca basica em cultos gerais ou grupos.

## Escopo

- Contratos compartilhados de presenca.
- Persistencia local de registros de presenca.
- Endpoint para listar presencas.
- Endpoint para criar presenca.
- Endpoint para atualizar presenca.
- Endpoint para remover presenca.
- Pagina de Presenca no painel.

## Fora De Escopo

- Check-in infantil.
- Impressao de etiquetas.
- Campus.
- Relatorios graficos.
- Integracao com calendario.
- Horarios detalhados de cultos.

## Criterios De Aceite

- A API lista presencas.
- Um admin consegue criar presenca.
- Um admin consegue editar presenca.
- Um admin consegue remover presenca.
- Um admin consegue marcar pessoas presentes.
- Lider e membro conseguem visualizar presencas.
- Lider e membro nao conseguem alterar presencas.

## Verificacao

- `npm.cmd run typecheck`: concluido.
- `npm.cmd run reset-dev-data`: pendente por bloqueio de execucao elevada no ambiente.
- `npm.cmd run build`: pendente por bloqueio de execucao elevada no ambiente.
- `GET /attendance`: pendente ate reiniciar API com a nova versao.
- `POST /attendance` com admin: pendente ate reiniciar API com a nova versao.
- `PUT /attendance/:id` com admin: pendente ate reiniciar API com a nova versao.
- `DELETE /attendance/:id` com admin: pendente ate reiniciar API com a nova versao.
- `GET /attendance` com membro: pendente ate reiniciar API com a nova versao.
- `POST /attendance` bloqueado para membro: pendente ate reiniciar API com a nova versao.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos criar relatorios de presenca ou seguir para Escalas e Cultos?
