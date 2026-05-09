# Fase 101 - Check-in 2.0: QR Do Responsavel

## Objetivo

Conectar o check-in feito pelo responsavel no app ao Totem Kids, permitindo que o responsavel apresente um QR do lote de criancas para a equipe imprimir as etiquetas corretas.

## Entregue

- O fluxo Kids do responsavel agora exibe um QR de check-in quando existem criancas ativas no culto.
- O QR representa o lote de criancas daquele responsavel naquele culto.
- O Totem Kids passa a reconhecer dois tipos de QR:
  - `ecclesiaos-kids-precheckin`: carrega o lote de criancas do responsavel;
  - `ecclesiaos-child-checkout`: registra retirada pela etiqueta.
- Ao ler QR do responsavel, o Totem Kids:
  - valida se o QR pertence ao culto aberto;
  - valida codigo de seguranca de cada crianca;
  - seleciona o lote lido;
  - exibe mensagem com quantidade carregada.
- O Totem Kids ganhou acao **Imprimir QR lido** para imprimir somente as etiquetas do lote escaneado.
- A impressao em lote continua disponivel para todos os presentes.

## Escopo intencional desta fase

Esta fase conecta o responsavel ao totem usando os registros de check-in ja criados no app. O QR ainda nao cria registros por si so; ele apenas carrega no totem o lote que ja foi gerado pelo responsavel.

Ainda nao foi implementado nesta fase:

- cadastro rapido de crianca pelo responsavel;
- criacao de check-in somente no momento da leitura do QR;
- expiracao temporal do QR;
- alternancia de camera frontal/traseira;
- relatorio final do culto.

## Arquivos alterados

- `apps/web/src/CheckInPage.tsx`
- `apps/web/src/KidsTotemPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-101-kids-precheckin-qr.md`
- `docs/decisions/0101-kids-precheckin-qr.md`
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

Adicionar cadastro de crianca pelo responsavel dentro do Check-in Kids:

- formulario simples de crianca;
- vinculo automatico ao responsavel logado;
- data de nascimento para sugestao de sala;
- dados complementares e observacoes.
