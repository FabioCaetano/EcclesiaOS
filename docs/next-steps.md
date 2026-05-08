# Proximos Passos

## Contexto Atual

O EcclesiaOS concluiu ate a **Fase 74 - Pessoas 2 - Campos Ampliados**.

Em 2026-05-07 foi registrado um feedback completo de produto em [[feedback-2026-05-07|Feedback De Produto - 2026-05-07]]. Esse feedback mudou a prioridade imediata: antes de novas automacoes, precisamos estabilizar fluxos que bloqueiam teste real e reduzir confusao nas telas operacionais.

Tambem em 2026-05-07 foi registrado o bloco [[feedback-2026-05-07-new-modules|Feedback De Produto - Novos Modulos - 2026-05-07]], com pedidos de musicas/playlists, liturgia/checklist, formularios, campos ampliados de pessoas e relatorios.

A base atual ja cobre:

- autenticacao com senha em hash, reset por email e usuarios vinculados a pessoas;
- PostgreSQL/Prisma como banco real local e JSON como fallback/teste;
- igreja unica com canal do YouTube, QR de visitante e templates de etiqueta;
- Inicio operacional com videos reais do canal via feed publico;
- pessoas com campos ampliados, grupos, ministerios com posicoes de servico, visitantes e mensagens em lote;
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

1. Publicar a Fase 74 no GitHub e redeployar Render/Vercel.
2. Aplicar migrations Prisma pendentes, incluindo `20260507150000_people_extended_fields`.
3. Seguir para Relatorios 1 - Pessoas.
4. Musicas/Liturgia e Formularios seguem planejados.
5. Check-in ainda pode evoluir com salas infantis por idade e dashboard por sala.

## Proximas Fases Recomendadas

### Relatorios 1 - Pessoas

Escopo provavel:

- aniversariantes da semana;
- total de membros;
- membros por mulheres/homens;
- adolescentes/kids por idade;
- filtros por status, idade e ministerio;
- exportacao CSV.

Valor: transforma o cadastro ampliado em informacao de gestao.

### Musicas E Liturgia

Escopo provavel:

- cadastro de musicas e tons;
- playlists/setlists por culto;
- checklist/liturgia por culto.

Valor: conecta Agenda, Louvor e operacao do culto.

### Musicas E Liturgia

Escopo provavel:

- cadastro de musicas e tons;
- playlists/setlists por culto;
- vinculo com evento/culto da Agenda;
- checklist/liturgia por culto;
- responsaveis e status por item.

Valor: conecta Agenda, Louvor e operacao do culto.

### Formularios

Escopo provavel:

- criador de formularios por admin;
- campos configuraveis;
- responsaveis por formulario;
- notificacoes/email de novas respostas;
- relatorios/exportacao por formulario.

Valor: cria captação estruturada de informacoes sem depender de ferramentas externas.

## Recomendacao Atual

Primeiro publicar a Fase 74. Depois seguir para **Relatorios 1 - Pessoas**.

Motivo: os dados necessarios para os relatorios iniciais ja foram adicionados em Pessoas.
# Proximos Passos Apos Fase 75

1. Validar a Fase 75 localmente com `npm run build:web`, `npm run build:api` e `npm test --workspace @ecclesiaos/api`.
2. Iniciar Fase 76 - Musicas e Repertorio:
   - cadastro de musicas;
   - tons disponiveis;
   - playlists por culto/evento;
   - visualizacao do repertorio dentro do culto.
3. Depois seguir para Liturgia/Checklist do culto.
4. Em seguida iniciar Formularios customizados.
# Proximos Passos Apos Fase 76

1. Subir a migracao `20260507160000_music_repertoire` no ambiente publicado.
2. Iniciar Fase 77 - Liturgia e Checklist do Culto:
   - checklist por culto/evento;
   - itens ordenados da liturgia;
   - responsavel por item;
   - marcacao de concluido durante o culto.
3. Depois conectar Agenda com:
   - repertorio do culto;
   - checklist/liturgia;
   - equipes solicitadas.
4. Em seguida iniciar Formularios customizados.
# Proximos Passos Apos Fase 77

1. Subir a migracao `20260507170000_service_checklists` no ambiente publicado.
2. Conectar Agenda com preparo do culto:
   - repertorio vinculado;
   - liturgia/checklist vinculada;
   - equipes solicitadas;
   - escala gerada.
3. Melhorar edicao do repertorio e da liturgia dentro da propria tela.
4. Iniciar Fase 78 - Formularios customizados.
# Proximos Passos Apos Fase 78

1. Criar navegação/atalhos entre Agenda e:
   - Escalas;
   - Musicas/Repertorio;
   - Liturgia.
2. Criar uma visão única operacional do culto.
3. Iniciar Fase 79 - Formularios customizados.
4. Depois evoluir Relatorios com dados de culto, check-in, presença e formulários.
# Proximos Passos Apos Fase 79

1. Subir a migracao `20260507180000_custom_forms` no ambiente publicado.
2. Evoluir Formularios:
   - notificacao/email para responsaveis;
   - exportacao CSV;
   - filtros por periodo/formulario;
   - relatorios.
3. Melhorar UX de criação dos campos.
4. Retomar visão unica operacional do culto.
# Proximos Passos Apos Fase 80

1. Criar filtros e busca nas respostas dos formularios.
2. Adicionar relatorios de formularios.
3. Registrar status de entrega de notificacoes.
4. Retomar visão unica operacional do culto.
