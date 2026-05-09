# Fase 99 - Check-in 2.0: Fluxo Do Responsavel

## Objetivo

Iniciar o Check-in 2.0 pelo fluxo do responsavel logado, permitindo que membro/visitante com usuario vinculado a uma pessoa faca check-in infantil somente das criancas vinculadas a ele.

## Entregue

- Membro comum abre Check-in diretamente na aba **Kids**.
- Abas administrativas de Check-in ficam ocultas para quem nao e lider/admin:
  - Eventos;
  - Administracao kids;
  - Salas;
  - Etiquetas.
- Responsavel logado ve uma area **Check-in das minhas criancas**.
- Criancas vinculadas ao responsavel aparecem como selecao rapida.
- Criancas ja ativas no culto ficam bloqueadas para evitar check-in duplicado pela interface.
- Ao gerar check-in, o app cria registros infantis para o culto selecionado.
- A lista mostra as criancas ativas do responsavel no culto e o codigo de seguranca.
- Backend passou a permitir `POST /child-checkins` para membro comum apenas quando:
  - usuario esta vinculado a uma pessoa;
  - crianca existe como pessoa cadastrada;
  - crianca possui o usuario logado como responsavel/familiar.
- Backend força os dados do responsavel logado ao criar check-in infantil por membro, evitando falsificar outro responsavel no payload.

## Escopo intencional desta fase

Esta fase ainda nao implementa o totem separado. Ela cria a base segura para o responsavel gerar o check-in pelo app.

Ainda nao foi implementado nesta fase:

- pagina publica/operacional de totem por culto;
- QR de pre-check-in para leitura no totem;
- leitura do QR do responsavel para imprimir etiquetas;
- cadastro rapido de crianca pelo responsavel;
- cadastro rapido de visitante pelo fluxo do totem;
- escolha de camera frontal/traseira.

## Arquivos alterados

- `apps/api/src/server.ts`
- `apps/web/src/CheckInPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-99-checkin-guardian-flow.md`
- `docs/decisions/0099-checkin-guardian-flow.md`
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

Criar o totem de Kids por culto:

- rota/tela de totem para um evento;
- leitor de QR/pre-check-in;
- impressao de etiquetas a partir dos registros ativos;
- dashboard operacional do culto;
- checkout manual e por QR.
