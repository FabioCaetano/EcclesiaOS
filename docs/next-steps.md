# Proximos Passos

## Contexto Atual

O EcclesiaOS concluiu ate a **Fase 65 - Substituto Automatico Para Recusas Em Escala**.

A base atual ja cobre:

- autenticacao com senha em hash, reset por email e usuarios vinculados a pessoas;
- PostgreSQL/Prisma como banco real local e JSON como fallback/teste;
- igreja unica com canal do YouTube, QR de visitante e templates de etiqueta;
- Inicio operacional com videos reais do canal via feed publico;
- pessoas, grupos, ministerios, visitantes e mensagens em lote;
- templates de mensagem com variaveis por destinatario;
- provedor de email via Resend com fallback seguro quando nao configurado;
- presenca historica consolidada a partir de check-ins;
- agenda/eventos com inscricoes publicas, ingresso, QR Code, pagamento manual, confirmacao opcional de email, reenvio administrativo de confirmacao e check-in self-service;
- cron real com ocorrencias materializadas como eventos filhos;
- ambientes, reservas e calendario mensal/semanal;
- check-in de evento, Kids, administracao kids, QR universal e etiquetas Brother;
- escalas estilo Planning Center: evento solicita equipes, lider escala a propria equipe, matrix view, lembretes por email e substitutos automaticos para recusas;
- financeiro com filtros/resumos/recibos;
- auditoria administrativa;
- testes automatizados de API, smoke tests do frontend e build/typecheck recorrentes.

## Banco E Deploy

O banco local e o banco Neon ja usam migrations Prisma.

Comandos importantes:

```powershell
npm run db:migrate
npm run db:migrate:deploy
npm run db:verify
npm run build:api
npm run build:web
```

Para ambiente publicado:

- API: Render Web Service.
- Banco: Neon PostgreSQL.
- Frontend: Vercel ou Render Static Site.
- Email: Resend opcional, configurado por `RESEND_API_KEY` e `EMAIL_FROM`.

## Proximas Opcoes Recomendadas

### Mensagens Em Lote Com Historico De Campanha

A Fase 53/61 criou envio e templates; falta transformar envios em campanhas rastreaveis.

Escopo provavel:

- entidade `MessageCampaign`;
- historico por destinatario;
- contagem de enviados, pulados e falhas;
- filtro por campanhas anteriores;
- reenvio para falhas.

Valor: melhora acompanhamento pastoral e comunicacao recorrente.

### Auditoria Avancada E Relatorios

Ampliar confiabilidade para uso real.

Escopo provavel:

- diff de campos na auditoria;
- filtros backend;
- exportacao CSV;
- relatorios de frequencia;
- relatorios de inscricoes/eventos;
- indicadores de visitantes e follow-up.

Valor: melhora governanca e acompanhamento.

## Recomendacao Atual

Seguir para **Auditoria Avancada E Relatorios**.

Motivo: depois de varias automacoes novas, a base precisa de mais rastreabilidade, filtros e exportacoes para uso real.
