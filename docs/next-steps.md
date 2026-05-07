# Proximos Passos

## Contexto Atual

O EcclesiaOS concluiu ate a **Fase 67 - UX De Ambientes E Check-in**.

Em 2026-05-07 foi registrado um feedback completo de produto em [[feedback-2026-05-07|Feedback De Produto - 2026-05-07]]. Esse feedback mudou a prioridade imediata: antes de novas automacoes, precisamos estabilizar fluxos que bloqueiam teste real e reduzir confusao nas telas operacionais.

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

## Bloqueadores Imediatos

1. Validar build/testes da Fase 67 quando o ambiente local permitir executar comandos novamente.
2. Publicar o hotfix/estabilizacao no GitHub e redeployar Render/Vercel.
3. Escalas ainda precisa amadurecer permissoes, visualizacao e indisponibilidade.
4. Posicoes de ministerios ainda precisam entrar para escalas por funcao real.
5. Igreja ainda precisa upload de logo e refinamento de identidade visual.

## Proximas Fases Recomendadas

### Fase 68 - Escalas Operacionais E Indisponibilidade

Escopo provavel:

- impedir membro de criar/editar escala;
- permitir que membro responda escala e registre indisponibilidade;
- simplificar tela mostrando pendencias relevantes;
- manter visao mensal para lider da equipe;
- preparar fluxo para posicoes de ministerio.

Valor: aproxima Escalas do fluxo real da igreja.

### Fase 69 - Posicoes Em Ministerios

Escopo provavel:

- adicionar posicoes configuraveis em ministerios/equipes;
- diferenciar grupo comum de ministerio/equipe operacional;
- usar posicoes na montagem da escala.

Valor: permite escalar louvor, midia e outras equipes por funcao real.

### Fase 70 - Marca Da Igreja E Refinos De Conta

Escopo provavel:

- upload de logo da igreja;
- uso do logo no app e em areas publicas;
- email de notificacao apos alteracao de senha;
- rever posicao da indisponibilidade entre Minha Conta e Escalas.

Valor: melhora identidade visual e seguranca percebida.

## Recomendacao Atual

Seguir para **Fase 68 - Escalas Operacionais E Indisponibilidade**.

Motivo: a Fase 67 iniciou a organizacao de Ambientes e Check-in; o proximo maior risco operacional esta nas permissoes e visualizacao de Escalas.
