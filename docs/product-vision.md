# Visao do Produto

## Nome

EcclesiaOS

## Proposito

Criar uma plataforma administrativa para uma igreja local gerenciar pessoas, ministerios, cultos, voluntarios, presenca, comunicacao, contribuicoes, eventos e conteudo, com evolucao gradual conforme a necessidade real da igreja.

## Escopo Inicial

O EcclesiaOS esta sendo desenhado para uma unica igreja especifica. Isso significa que nao vamos assumir, por padrao:

- multiplas igrejas independentes na mesma instalacao;
- marketplace publico;
- subdominios por igreja;
- cobranca SaaS;
- permissoes complexas para redes/campus;
- integracoes externas antes de existir necessidade concreta.

Essas capacidades podem ser adicionadas depois, mas apenas mediante decisao registrada.

## Inspiracao Permitida

O projeto B1Admin existente pode inspirar:

- separacao por modulos;
- navegacao principal e secundaria;
- uso de testes E2E como especificacao viva;
- modelagem de areas como pessoas, grupos, doacoes, formularios, serving e website;
- abordagem de PWA/admin responsivo.

## O Que Nao Sera Copiado Automaticamente

- Dependencia das APIs ChurchApps/B1.
- Multi-tenant completo.
- Todos os modulos de uma vez.
- Estrutura de permissoes antes de termos papeis reais.
- Integracoes completas como Stripe, PraiseCharts, YouTube/Vimeo por API oficial, Lessons ou Ask antes de validacao.

## Publico Principal

- Administradores da igreja.
- Lideres de ministerio.
- Equipe financeira.
- Voluntarios autorizados.
- Eventualmente membros, se houver area publica/app.

## Estado Funcional Atual

O produto ja cobre:

- login de admin, lider e membro, com troca/reset de senha por email;
- cadastro da igreja com canal do YouTube configuravel, QR de visitante e templates de etiqueta;
- Inicio como painel operacional com videos reais do YouTube via feed publico;
- pessoas com vinculo usuario/pessoa, responsavel/crianca, visitantes e mensagens em lote;
- grupos e ministerios;
- presenca historica consolidada por check-in de evento;
- agenda/eventos com inscricoes, ingresso, check-in de participantes administrativo e self-service, confirmacao opcional de email, reenvio de confirmacao, local sugerido por Ambientes e cron real materializado;
- ambientes, reservas e calendario mensal/semanal;
- check-in de evento, Kids, administracao kids, etiquetas, QR universal, impressao Brother e retirada por responsavel;
- escalas com solicitacao de equipes pelo evento, lider escalando a propria equipe, matrix view, confirmacao, substitutos automaticos para recusas, lembretes e notificacoes por email;
- financeiro com filtros, resumos e recibo inicial;
- auditoria administrativa;
- usuarios, permissao inicial por modulo e templates de mensagem com variaveis;
- provedor de email Resend com fallback quando nao configurado;
- PostgreSQL/Prisma validado localmente;
- testes de API e smoke tests do frontend.

## Proxima Direcao De Produto

Depois da base operacional atual, as proximas escolhas naturais sao:

- transformar mensagens em lote em campanhas rastreaveis;
- aprofundar auditoria, permissoes, relatorios e governanca.

## Resultado Desejado

Um sistema confiavel, facil de evoluir e fiel ao fluxo real da igreja, em vez de um produto inchado tentando resolver todos os casos possiveis desde o inicio.
