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

- login de admin, lider e membro;
- cadastro da igreja com canal do YouTube configuravel;
- Inicio como painel operacional;
- pessoas com vinculo usuario/pessoa e responsavel/crianca;
- grupos e ministerios;
- presenca historica consolidada por check-in de evento;
- agenda/eventos com inscricoes, ingresso, check-in de participantes, local sugerido por Ambientes e recorrencia textual;
- ambientes, reservas e calendario mensal/semanal;
- check-in de evento, Kids, administracao kids, etiquetas, QR Code, impressao Brother e retirada por responsavel;
- escalas com confirmacao propria;
- financeiro com filtros, resumos e recibo inicial;
- auditoria administrativa;
- usuarios e permissao inicial por modulo;
- PostgreSQL/Prisma validado localmente;
- testes de API e smoke tests do frontend.

## Proxima Direcao De Produto

Depois da base operacional atual, as proximas escolhas naturais sao:

- buscar ultimas lives por backend usando integracao real com YouTube;
- transformar expressao cron textual em ocorrencias reais da agenda;
- remodelar Escalas para nascerem da necessidade de equipes solicitadas no evento;
- criar mensagens em lote na aba Pessoas com filtros dinamicos;
- aprofundar auditoria, permissoes e relatorios.

## Resultado Desejado

Um sistema confiavel, facil de evoluir e fiel ao fluxo real da igreja, em vez de um produto inchado tentando resolver todos os casos possiveis desde o inicio.
