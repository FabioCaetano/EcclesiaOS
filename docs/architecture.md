# Arquitetura Atual

## Direcao Geral

O EcclesiaOS e uma aplicacao propria com frontend, backend, contratos compartilhados, persistencia local para testes isolados e PostgreSQL/Prisma validado como banco real de desenvolvimento local.

Arquitetura atual:

- Frontend web administrativo em React + Vite + TypeScript.
- API propria em Node.js + TypeScript.
- Contratos compartilhados em `packages/shared`.
- Persistencia local atual em PostgreSQL via Prisma.
- Persistencia JSON mantida para testes automatizados e fallback.
- Autenticacao propria por token assinado.
- Testes automatizados de API com `node:test`.
- Smoke tests do frontend com Playwright.
- Documentacao de fases e decisoes no Obsidian.

## Referencia Do Projeto Atual

O B1Admin usa:

- React + TypeScript + Vite.
- React Router.
- Material UI.
- Modulos por area funcional.
- APIs externas por dominio.
- Playwright para testes E2E.
- PWA.

Para EcclesiaOS, podemos reaproveitar a ideia de modularidade, mas nao a dependencia de APIs externas.

## Fronteiras De Modulo

Modulos atuais e planejados:

- `auth`: login, sessao, usuario atual.
- `church`: cadastro da igreja unica.
- `people`: cadastro minimo de pessoas.
- `groups`: grupos, ministerios, classes e equipes.
- `attendance`: presenca historica e consolidacao automatica de check-ins por evento.
- `events`: agenda, eventos, inscricoes, ingresso, check-in de participantes, locais sugeridos por Ambientes e recorrencia textual.
- `checkin`: check-in de eventos, Kids, administracao kids, etiquetas, QR Code, retirada e mensagem ao responsavel.
- `resources`: ambientes e reservas com bloqueio de conflito.
- `calendar`: calendario mensal/semanal consolidando eventos e reservas.
- `serving`: escalas, planos de culto, voluntarios e confirmacao propria.
- `finance`: receitas, despesas, filtros, resumos e recibo inicial.
- `users`: gestao administrativa de usuarios e vinculo usuario/pessoa.
- `audit`: consulta administrativa de auditoria.
- `communication`: emails, mensagens e notificacoes futuras.
- `settings`: preferencias futuras.
- `reports`: consultas, dashboards e exportacoes futuras.

Nenhum modulo sera implementado automaticamente apenas por estar listado aqui.

## Stack Definida

- Frontend: React + TypeScript + Vite.
- Backend: Node.js + TypeScript.
- Banco real: PostgreSQL.
- ORM: Prisma.
- UI: CSS proprio por enquanto.
- Testes API: `node:test`.
- Smoke tests frontend: Playwright.

## Banco E Persistencia

O ambiente manual local usa PostgreSQL/Prisma por `.env`:

```text
ECCLESIAOS_DATA_PROVIDER=prisma
DATABASE_URL=postgresql://ecclesiaos:ecclesiaos@localhost:5432/ecclesiaos?schema=public
```

O provider JSON continua existindo para testes automatizados e fallback, evitando depender de Docker em suites isoladas.

## Pontos De Integracao Preparados

- YouTube: a igreja armazena `youtubeChannelUrl`; a Inicio usa esse campo para preparar a area de transmissoes.
- Cron: eventos armazenam `recurrenceRule` quando `recurrence` e `cron`; geracao automatica de ocorrencias ainda sera fase futura.
- Mensagens: Administracao kids abre WhatsApp/SMS para responsavel; envio interno auditavel ainda sera fase futura.

## Padrao De Desenvolvimento

Cada fase deve gerar:

- documento de escopo;
- decisoes registradas;
- modelo de dados envolvido;
- endpoints ou telas previstas;
- criterios de aceite;
- testes minimos;
- pergunta explicita antes de iniciar implementacao.
