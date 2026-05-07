# EcclesiaOS

Sistema de gestao e operacao para igreja local.

Este projeto nasce como uma reimplementacao propria, inspirada na arquitetura modular do B1Admin existente neste workspace, mas sem depender das APIs ChurchApps/B1. O objetivo e construir uma plataforma sob medida, faseada, documentada e validada decisao por decisao.

## Principios

- Atender primeiro uma igreja especifica, nao uma rede multi-tenant complexa.
- Criar APIs proprias desde o inicio.
- Desenvolver por fases pequenas e verificaveis.
- Antes de cada fase funcional, confirmar o escopo com o responsavel do projeto.
- Manter documentacao concreta como fonte de verdade.
- Usar o projeto B1Admin apenas como referencia arquitetural e de funcionalidades.

## Documentacao

- [Indice Geral](docs/index.md)
- [Status Do Projeto](docs/project-status.md)
- [Processo De Desenvolvimento](docs/process.md)
- [Visao do Produto](docs/product-vision.md)
- [Arquitetura Inicial](docs/architecture.md)
- [Roadmap Faseado](docs/roadmap.md)
- [Modelo de Decisoes](docs/decision-log.md)
- [Backlog de Perguntas](docs/questions.md)
- [Desenvolvimento Local](docs/development.md)
- [Estrutura Do Projeto](docs/project-structure.md)
- [Proximos Passos](docs/next-steps.md)

## Estado Atual

Fase atual concluida: Fase 58 - Matrix View De Equipes Em Escalas.

Estrutura:

- `apps/web`: frontend React/Vite.
- `apps/api`: API Node/TypeScript.
- `packages/shared`: contratos compartilhados.
- `docs`: documentacao de produto, fases, decisoes e processo.

Modulos ja implementados:

- autenticacao para admin, lider e membro;
- persistencia local de desenvolvimento;
- cadastro da igreja unica;
- pessoas;
- grupos e ministerios.

Proxima recomendacao: criar uma fase de layout/navegacao para separar a tela unica atual em paginas.
