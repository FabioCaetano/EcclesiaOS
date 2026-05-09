# Fase 102 - Check-in 2.0: Cadastro De Crianca Pelo Responsavel

## Objetivo

Permitir que o responsavel logado cadastre uma crianca diretamente dentro do Check-in Kids, sem precisar acessar a aba Pessoas e sem depender de um operador para criar o vinculo inicial.

## Entregue

- Novo contrato compartilhado `GuardianChildInput`.
- Nova rota autenticada `POST /people/my-children`.
- Backend cria a crianca sempre vinculada ao `personId` do usuario logado.
- Backend bloqueia cadastro se o usuario nao estiver vinculado a uma pessoa.
- Frontend ganhou helper `createMyChild`.
- Aba Kids do responsavel ganhou formulario **Adicionar crianca** com:
  - nome;
  - sobrenome;
  - data de nascimento;
  - observacoes.
- Ao cadastrar, a crianca:
  - e criada como pessoa;
  - e vinculada automaticamente ao responsavel;
  - entra selecionada para o check-in do culto.

## Escopo intencional desta fase

Esta fase cria apenas o cadastro reduzido da crianca pelo responsavel. A edicao completa continua no cadastro de Pessoas para lider/admin.

Ainda nao foi implementado nesta fase:

- edicao de crianca pelo responsavel;
- campos medicos estruturados;
- autorizados adicionais para retirada;
- foto da crianca;
- revisao/aprovacao administrativa do cadastro.

## Arquivos alterados

- `packages/shared/src/index.ts`
- `apps/api/src/server.ts`
- `apps/web/src/api.ts`
- `apps/web/src/CheckInPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-102-guardian-child-registration.md`
- `docs/decisions/0102-guardian-child-registration.md`
- `docs/decision-log.md`
- `docs/index.md`
- `docs/project-status.md`
- `docs/next-steps.md`
- `docs/roadmap.md`

## Validacao

- `npm run build:api`: pendente nesta execucao.
- `npm run build:web`: pendente nesta execucao.

## Bloqueio de validacao

O ambiente atual nao permitiu execucao de comandos PowerShell no sandbox:

`CreateProcessAsUserW failed: 1920`

## Proxima fase recomendada

Melhorar o leitor de QR/camera:

- selecionar camera;
- alternar frontal/traseira;
- mensagens melhores de permissao;
- feedback visual ao ler QR.
