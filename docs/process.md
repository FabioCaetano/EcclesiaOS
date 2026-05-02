# Processo De Desenvolvimento

## Regra Principal

O EcclesiaOS deve evoluir por fases pequenas, documentadas e verificaveis.

Antes de cada fase funcional:

1. registrar a pergunta de decisao;
2. confirmar ou assumir uma decisao simples;
3. criar/atualizar documento de fase;
4. implementar escopo pequeno;
5. validar com comandos e chamadas reais;
6. atualizar status e proximos passos.

## Documentos Obrigatorios Por Fase

Cada fase deve ter:

- uma entrada em `docs/roadmap.md`;
- um arquivo em `docs/phases`;
- se houver decisao relevante, um arquivo em `docs/decisions`;
- atualizacao em `docs/project-status.md`;
- atualizacao em `docs/development.md` se novos comandos/endpoints forem criados.

## Padrao De Decisao

Decisoes ficam em `docs/decisions`.

Formato:

- Status;
- Contexto;
- Decisao;
- Consequencias;
- Nao objetivos, quando necessario.

## Padrao De Fase

Fases ficam em `docs/phases`.

Formato:

- Objetivo;
- Status;
- Escopo;
- Fora de escopo;
- Criterios de aceite;
- Verificacao;
- Proxima pergunta.

## Validacao Minima

Antes de considerar uma fase concluida, rodar:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

Quando a fase altera backend, permissoes ou contratos, rodar tambem:

```powershell
npm.cmd run test
```

Quando a fase altera a interface autenticada ou navegacao principal, rodar tambem:

```powershell
npm.cmd run test:web
```

Quando a fase altera dados locais:

```powershell
npm.cmd run reset-dev-data
```

Quando a fase adiciona endpoints, validar chamadas reais via API.

## Como Evitar Escopo Solto

- Nao adicionar modulo novo sem fase documentada.
- Nao adicionar campo de dominio apenas por possibilidade futura.
- Nao implementar campus, multi-igreja ou SaaS ate haver decisao registrada.
- Nao trocar para banco real sem uma fase propria.
- Nao copiar funcionalidades do B1Admin automaticamente.
- Nao abrir dados sensiveis sem registrar a regra de permissao da fase.

## Convencoes Atuais

- Textos e arquivos em ASCII para evitar problemas de encoding.
- API propria, sem dependencia das APIs B1/ChurchApps.
- PostgreSQL/Prisma como provider padrao do ambiente manual local via `.env`.
- JSON local em `apps/api/data/dev-db.json` mantido para testes automatizados e fallback.
- Contratos compartilhados em `packages/shared/src/index.ts`.
- Documentacao pensada para Obsidian com links `[[nota]]`.
