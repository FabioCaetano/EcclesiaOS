# Fase 100 - Check-in 2.0: Totem Kids Por Culto

## Objetivo

Criar uma tela operacional especifica para o ministerio infantil administrar um culto/evento, visualizando criancas presentes, imprimindo etiquetas e registrando retirada por QR ou manualmente.

## Entregue

- Nova tela autenticada `KidsTotemPage`.
- Nova rota autenticada `/kids-totem/:eventId`.
- Botao **Totem Kids** dentro da aba Check-in, usando o culto/evento selecionado.
- Acesso restrito a `admin` e `leader`.
- Dashboard do totem com:
  - criancas presentes;
  - retiradas;
  - total do culto;
  - salas em uso.
- Filtro por sala e busca por crianca/responsavel.
- Lista de criancas do culto com status **Presente** ou **Saiu**.
- Preview de etiqueta individual.
- Impressao individual de etiqueta Brother.
- Impressao em lote das criancas presentes.
- Leitor de QR para checkout infantil.
- Checkout manual pelo operador.
- Botao de retorno para o app, voltando ao Check-in.

## Escopo intencional desta fase

O totem opera sobre registros de check-in infantil ja criados pelo app ou pela operacao atual. A leitura de QR nesta fase valida QR de retirada da etiqueta.

Ainda nao foi implementado nesta fase:

- QR de pre-check-in gerado antes da chegada;
- leitura do QR do responsavel para transformar pre-check-in em etiqueta;
- cadastro rapido de visitante dentro do totem;
- cadastro/edicao de criancas pelo responsavel;
- alternancia explicita de camera frontal/traseira;
- relatorio final do culto exportavel.

## Arquivos alterados

- `apps/web/src/KidsTotemPage.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/CheckInPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-100-kids-totem.md`
- `docs/decisions/0100-kids-totem.md`
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

Evoluir o pre-check-in com QR do responsavel:

- responsavel gera QR do lote de criancas selecionadas;
- totem le esse QR;
- operador confirma entrada;
- etiquetas sao impressas para o lote;
- evitar duplicidade por evento/crianca.
