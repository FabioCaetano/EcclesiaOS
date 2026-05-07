# Proximos Passos

## Contexto Atual

O EcclesiaOS concluiu ate a **Fase 66 - Estabilizacao De Agenda, Recorrencia E Rotas Publicas**.

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

1. Ambientes mistura criacao de ambiente e reserva, e erros de criacao aparecem no formulario errado.
2. Check-in ainda concentra muitas funcoes em uma tela confusa para operacao real.
3. Etiquetas e impressoras ainda precisam migrar da Igreja para Check-in com preview configuravel.
4. Escalas ainda precisa amadurecer permissoes, visualizacao e indisponibilidade.

## Proximas Fases Recomendadas

### Fase 67 - UX De Ambientes E Check-in

Escopo provavel:

- separar criacao de ambiente e criacao de reserva;
- mostrar erros no formulario correto;
- mover etiquetas e configuracao de impressao para Check-in;
- criar preview de etiqueta com campos selecionaveis;
- organizar Check-in em Evento, Kids e Administracao;
- criar dashboard do dia para eventos e kids.

Valor: reduz confusao operacional nas telas usadas durante culto/evento.

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

Seguir para **Fase 67 - UX De Ambientes E Check-in**.

Motivo: a Fase 66 desbloqueou Agenda e rotas publicas; o proximo maior atrito esta na organizacao de Ambientes, etiquetas e Check-in.
