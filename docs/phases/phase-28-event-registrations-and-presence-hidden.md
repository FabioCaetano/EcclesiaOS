# Fase 28: Inscricoes De Eventos E Presenca Oculta

## Objetivo

Permitir inscricoes publicas em eventos com controle de vagas e preparar a transicao da antiga tela de Presenca para fluxos mais operacionais de check-in e eventos.

## Status

Concluida.

## Escopo

- Ocultar a aba `Presenca` da navegacao principal.
- Manter endpoints e codigo de presenca existentes para consulta futura e possivel consolidacao.
- Adicionar campos de inscricao em eventos:
  - `registrationEnabled`;
  - `registrationCapacity`;
  - `registrationPrice`;
  - `registrationCurrency`;
  - `registrationSlug`.
- Criar tipo `EventRegistration`.
- Criar migration `20260430240000_event_registrations`.
- Criar tabela `EventRegistrationRecord`.
- Criar repositorio de inscricoes para JSON e Prisma.
- Criar endpoints publicos:

```text
GET  /public/events/:slug
POST /public/events/:slug/registrations
```

- Criar endpoint administrativo:

```text
GET /event-registrations
```

- Criar pagina publica:

```text
/register/:slug
```

- Mostrar link de inscricao na tela de Agenda quando o evento tiver inscricoes habilitadas.
- Controlar limite de vagas por quantidade inscrita.
- Marcar inscricoes gratuitas como `confirmed`.
- Marcar inscricoes pagas como `pending_payment`.

## Fora De Escopo

- Gateway de pagamento.
- Envio automatico de email/WhatsApp.
- QR Code de ingresso.
- Check-in publico por ingresso.
- Reservas de ambientes.
- Calendario visual completo da igreja.

## Criterios De Aceite

- Admin consegue habilitar inscricao em evento.
- Evento com slug publico pode ser acessado sem login.
- Pessoa externa consegue se inscrever em evento gratuito.
- Evento pago registra valor devido e fica pendente de pagamento.
- Limite de vagas bloqueia inscricoes acima da capacidade.
- A aba `Presenca` nao aparece mais no menu principal.
- Admin consegue listar inscricoes pela API autenticada.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd run reset-dev-data
npm.cmd run db:verify
```

Resultados:

- `typecheck`: concluido.
- `test`: 14 testes API passando.
- `build`: concluido.
- `reset-dev-data`: concluido.
- `db:verify`: `Event registrations: 0` e credenciais semente validadas.
- Migracao `20260430240000_event_registrations` aplicada apos reset do schema local de desenvolvimento.

## Observacao Sobre Banco Local

A primeira tentativa da migration falhou porque eventos existentes receberam `registrationSlug` vazio e o indice unico encontrou duplicidade. A migration foi corrigida para preencher slugs existentes com o `id` do evento antes de criar o indice unico.

Como o banco e local de desenvolvimento, o schema foi resetado e os dados semente foram recriados.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos seguir com reservas de ambientes, calendario visual da igreja, ou aprofundar inscricoes com pagamento/ingressos?
