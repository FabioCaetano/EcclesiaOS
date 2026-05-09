# Fase 103 - Check-in 2.0: Selecao De Camera No QR

## Objetivo

Melhorar a experiencia de leitura de QR em celular/tablet, permitindo selecionar a camera e alternar entre cameras disponiveis.

## Entregue

- Hook `useQrScanner` passou a listar cameras disponiveis apos permissao do navegador.
- Hook passou a guardar `selectedDeviceId`.
- Hook ganhou `setSelectedDeviceId` e `switchCamera`.
- Quando uma camera e selecionada, o scanner reinicia usando `deviceId` especifico.
- O primeiro acesso ainda tenta camera traseira por `facingMode: environment`.
- Check-in Kids/Admin ganhou seletor de camera quando ha mais de uma camera.
- Totem Kids ganhou seletor de camera e botao **Virar camera**.
- Leitor de ingressos em Agenda/Eventos tambem ganhou seletor e troca de camera.

## Escopo intencional desta fase

Esta fase melhora o controle de camera usando APIs nativas do navegador. A lista de cameras depende de permissao concedida pelo navegador.

Ainda nao foi implementado nesta fase:

- overlay visual de mira no video;
- som/vibracao apos leitura;
- persistir a camera preferida no usuario;
- fallback especial para navegadores antigos alem do campo manual existente.

## Arquivos alterados

- `apps/web/src/useQrScanner.ts`
- `apps/web/src/CheckInPage.tsx`
- `apps/web/src/KidsTotemPage.tsx`
- `apps/web/src/EventsPage.tsx`
- `docs/phases/phase-103-qr-camera-selection.md`
- `docs/decisions/0103-qr-camera-selection.md`
- `docs/decision-log.md`
- `docs/index.md`
- `docs/project-status.md`
- `docs/next-steps.md`
- `docs/roadmap.md`

## Validacao

- `npm run build:web`: pendente nesta execucao.

## Bloqueio de validacao

O ambiente atual nao permitiu execucao de comandos PowerShell no sandbox:

`CreateProcessAsUserW failed: 1920`

## Proxima fase recomendada

Evoluir dados da crianca no Check-in Kids:

- autorizados adicionais de retirada;
- alergias/observacoes medicas;
- aviso visual no totem e etiqueta;
- edicao limitada pelo responsavel.
