# Proximos Passos

## Contexto Atual

O EcclesiaOS concluiu ate a **Fase 73 - Check-in UX 2**.

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
- check-in de evento, Kids, administracao kids, painel operacional por culto/evento, QR universal e etiquetas Brother;
- escalas estilo Planning Center: evento solicita equipes, lider escala a propria equipe por posicao, pessoas habilitadas por posicao, matrix view para admin/lider, pendencias por perfil, indisponibilidade no modulo, lembretes por email e substitutos automaticos por posicao;
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

1. Publicar a Fase 73 no GitHub e redeployar Render/Vercel.
2. Aplicar migrations Prisma `20260507130000_group_service_positions` e `20260507140000_group_member_service_positions` no ambiente publicado.
3. Check-in ainda pode evoluir com salas infantis por idade e dashboard por sala.
4. Financeiro ainda pode evoluir em relatorios/exportacao.
5. Igreja ainda precisa upload de logo e refinamento de identidade visual, mas essa fase foi pulada por enquanto.

## Proximas Fases Recomendadas

### Check-in Salas Infantis

Escopo provavel:

- salas infantis por idade;
- dashboard por sala;
- fila de criancas aguardando retirada por sala;
- acoes rapidas de mensagem ao responsavel;
- refinamento da area de etiquetas e impressao.

Valor: aproxima Check-in de um fluxo real de domingo.

### Financeiro 2

Escopo provavel:

- relatorios por periodo;
- exportacao CSV;
- visao por fundo/categoria;
- melhorias de recibo.

Valor: torna o financeiro mais util para operacao mensal.

## Recomendacao Atual

Primeiro publicar a Fase 73. Depois seguir para **Check-in Salas Infantis** ou **Financeiro 2**.

Motivo: pulamos Marca e Auditoria por enquanto; Check-in agora tem contexto operacional, e pode ganhar profundidade real com salas ou podemos voltar ao Financeiro.
