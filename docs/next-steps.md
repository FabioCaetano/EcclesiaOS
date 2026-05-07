# Proximos Passos

## Contexto Atual

O EcclesiaOS concluiu ate a **Fase 69 - Posicoes Em Ministerios**.

Em 2026-05-07 foi registrado um feedback completo de produto em [[feedback-2026-05-07|Feedback De Produto - 2026-05-07]]. Esse feedback mudou a prioridade imediata: antes de novas automacoes, precisamos estabilizar fluxos que bloqueiam teste real e reduzir confusao nas telas operacionais.

A base atual ja cobre:

- autenticacao com senha em hash, reset por email e usuarios vinculados a pessoas;
- PostgreSQL/Prisma como banco real local e JSON como fallback/teste;
- igreja unica com canal do YouTube, QR de visitante e templates de etiqueta;
- Inicio operacional com videos reais do canal via feed publico;
- pessoas, grupos, ministerios com posicoes de servico, visitantes e mensagens em lote;
- templates de mensagem com variaveis por destinatario;
- provedor de email via Resend com fallback seguro quando nao configurado;
- presenca historica consolidada a partir de check-ins;
- agenda/eventos com inscricoes publicas, ingresso, QR Code, pagamento manual, confirmacao opcional de email, reenvio administrativo de confirmacao e check-in self-service;
- cron real com ocorrencias materializadas como eventos filhos;
- ambientes, reservas e calendario mensal/semanal;
- check-in de evento, Kids, administracao kids, QR universal e etiquetas Brother;
- escalas estilo Planning Center: evento solicita equipes, lider escala a propria equipe por posicao, matrix view para admin/lider, pendencias por perfil, indisponibilidade no modulo, lembretes por email e substitutos automaticos para recusas;
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

## Bloqueadores Imediatos

1. Publicar a Fase 69 no GitHub e redeployar Render/Vercel.
2. Aplicar migration Prisma `20260507130000_group_service_positions` no ambiente publicado.
3. Igreja ainda precisa upload de logo e refinamento de identidade visual.
4. Check-in ainda precisa dashboard operacional mais claro para Kids/Eventos.
5. Posicoes por pessoa ainda precisam entrar para substitutos mais precisos.

## Proximas Fases Recomendadas

### Fase 70 - Marca Da Igreja E Refinos De Conta

Escopo provavel:

- upload de logo da igreja;
- uso do logo no app e em areas publicas;
- email de notificacao apos alteracao de senha;
- rever posicao da indisponibilidade entre Minha Conta e Escalas.

Valor: melhora identidade visual e seguranca percebida.

## Recomendacao Atual

Primeiro publicar a Fase 69. Depois seguir para **Fase 70 - Marca Da Igreja E Refinos De Conta**.

Motivo: Escalas ja possui posicoes por ministerio; o proximo bloco aberto do feedback e identidade visual da igreja e refinamentos de conta.
