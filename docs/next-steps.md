# Proximos Passos

## Contexto Atual

O EcclesiaOS concluiu ate a Fase 42:

- base tecnica;
- autenticacao;
- persistencia local e PostgreSQL/Prisma validado;
- igreja;
- pessoas;
- grupos e ministerios;
- layout e navegacao;
- presenca e relatorios simples;
- escalas com confirmacao propria e notificacoes internas;
- financeiro com filtros, resumos e recibo inicial;
- testes automatizados de API;
- smoke tests do frontend;
- verificacao runtime Prisma concluida.
- permissao granular inicial do Financeiro.
- banco local Prisma configurado por `.env`;
- login real dos usuarios admin, lider e membro validado.
- gestao administrativa inicial de usuarios;
- matriz inicial de acesso por modulo.
- senha com hash `scrypt`.
- auditoria inicial de usuarios, pessoas e financeiro.
- agenda/eventos com CRUD inicial e seed no PostgreSQL.
- presenca vinculada a eventos e agenda com recorrencia simples.
- check-in por evento e check-in infantil para cultos.
- inscricoes publicas em eventos com link, limite de vagas e status de pagamento manual;
- aba Presenca oculta da navegacao principal.
- reservas de ambientes com bloqueio de conflito por horario.
- calendario mensal consolidando eventos e reservas.
- calendario semanal com detalhe do dia e filtro por ambiente.
- registro publico com pessoa e usuario vinculados.
- etiquetas infantis e retirada com pessoa do operador registrada.
- responsaveis permanentes vinculados a criancas no cadastro de pessoas.
- retirada infantil por responsavel logado com codigo de seguranca.
- QR Code real na etiqueta infantil.
- leitura de QR Code pela camera com fallback manual.
- presets de impressao Brother para etiqueta infantil.
- inscricoes com lista de participantes, status manual e comprovante imprimivel.
- QR Code de ingresso e check-in de participantes.
- impressao em lote de etiquetas infantis para Brother.
- tela de auditoria administrativa com filtros.
- check-ins de pessoas consolidados automaticamente em presenca por evento.
- Inicio redesenhado como painel operacional.
- canal do YouTube configuravel no cadastro da igreja.
- Agenda sugerindo Ambientes ativos no campo Local.
- Eventos com expressao cron textual.
- Check-in separado internamente em Eventos, Kids e Administracao kids.
- Administracao kids com link de mensagem para responsavel.

## Banco Real Validado

Foram executados com sucesso:

```powershell
docker compose up -d postgres
npm run db:migrate
$env:ECCLESIAOS_DATA_PROVIDER='prisma'
$env:DATABASE_URL='postgresql://ecclesiaos:ecclesiaos@localhost:5432/ecclesiaos?schema=public'
npm run reset-dev-data
npm run db:verify
```

Tambem foi validado login admin e leitura de financeiro pela API compilada em modo Prisma.

## Proximas Opcoes

### YouTube E Cron Real

Buscar ultimas lives via backend e transformar expressao cron em ocorrencias reais da agenda.

### Nova Arquitetura De Escalas

Permitir que a pessoa que cria o evento indique quais equipes servirao, que lideres visualizem eventos da sua equipe, montem a escala e acompanhem aceite/recusa mensal.

### Mensagens Em Lote Em Pessoas

Criar filtros dinamicos como todos, visitantes, membros, lideres, visitantes registrados hoje, visitantes com 30 dias e visitantes que nunca receberam mensagem.

### Calendario Avancado

Adicionar edicao rapida dos itens, filtros por grupo e endpoint agregado.

### Reservas De Ambientes Avancadas

Adicionar recorrencia, solicitacao/aprovacao e filtros por ambiente.

### Etiquetas Infantis

Preparar impressao/visualizacao de etiqueta com codigo de seguranca para retirada.

### QR Code Infantil

Adicionar codigo digital a etiqueta e validar retirada pelo codigo.

### Troca E Reset De Senha

Criar troca propria de senha e fluxo administrativo de reset.

### Novo Modulo Funcional

Definir o proximo dominio depois de Pessoas, Grupos, Presenca, Escalas e Financeiro.

### Matriz De Permissoes Avancada

Expandir a regra granular para incluir tesouraria e permissoes por acao.

### Inscricoes De Eventos Avancadas

Evoluir do controle manual para QR Code de ingresso, check-in de participantes e envio de comprovante.

### Auditoria Avancada

Adicionar diff de campos, exportacao e filtros no backend quando o volume crescer.

### Relatorios De Frequencia

Criar indicadores a partir da presenca consolidada por evento, grupo e pessoa.
