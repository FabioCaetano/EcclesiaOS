# Decisao 0047: Templates De Etiqueta E Camera QR Universal

## Status

Aceita.

## Contexto

Dois problemas operacionais surgiram:

1. A leitura de QR Code pela camera nao abre em navegadores que nao expoem `BarcodeDetector` (Firefox, Safari antigo, Chrome em alguns Android). Hoje o codigo apenas mostra "Leitura por camera indisponivel" e nem solicita permissao da camera.
2. Os presets de etiqueta Brother estao fixos no codigo (`Brother DK-1202 62x100mm` e `Brother 62mm continuo`). A igreja precisa registrar o modelo real que tem, criar tamanhos diferentes para outros usos (visitante, evento) e ter um padrao salvo.

## Decisao

### Camera QR universal

Adicionar `jsqr` (decoder JS de QR Code, ~45KB, MIT, sem deps nativas) como fallback. O fluxo passa a ser:

1. Pedir permissao da camera com `facingMode: { ideal: "environment" }` (preferencia, nao obrigatoria) para permitir laptops sem camera traseira.
2. Tentar usar `BarcodeDetector` quando disponivel.
3. Caso contrario, usar `jsqr` decodificando frames do canvas.
4. Erros sao surfaceados com mensagem amigavel diferenciando: navegador sem suporte a camera, permissao negada, sem cameras disponiveis, sem decoder.

A logica de scanner fica extraida em um hook `useQrScanner` reutilizado por Check-in e Agenda.

### Templates de etiqueta

Criar entidade `LabelTemplate` cujo cadastro substitui os presets fixos:

```text
LabelTemplate {
  id
  name              # "Kids - DK-1202", "Visitante 62mm"
  printerModel      # "Brother DK-1202", "Brother QL-820NWB"
  widthMm           # numero
  heightMm          # numero (0 quando continuo)
  isContinuous      # bool, fita continua sem altura fixa
  layout            # enum: "kids_checkin" | "visitor"
  isDefault         # bool, marca o padrao por layout
}
```

Regras:

- A api expoe CRUD em `/label-templates`, restrito a admin para escrita.
- Apenas um template por layout pode ter `isDefault = true`. A API garante que ao marcar um, os demais do mesmo layout caem para `false`.
- Seed inicial cria os dois presets historicos como `kids_checkin` mais um exemplo `visitor` para mostrar o caminho.
- Check-in passa a renderizar opcoes a partir dos templates `kids_checkin` cadastrados.
- A tela Pessoas ganha um botao para imprimir uma etiqueta de visitante usando o template `visitor` padrao.
- Cada template pode ser impresso em modo de teste com dados de exemplo a partir da nova secao "Etiquetas" no cadastro da igreja.
- O CSS de impressao continua usando os mesmos presets dimensionais conhecidos pela impressora; a `widthMm`/`heightMm` controla `@page size` no momento da impressao.

## Consequencias

- A camera funciona em qualquer navegador moderno com suporte a `getUserMedia`.
- Novas dependencias: `jsqr` no frontend.
- O cadastro da igreja ganha uma nova area de configuracao operacional, aproximando o produto do dia a dia.
- A logica de etiqueta deixa de ser hardcoded; novos modelos podem ser adicionados sem deploy de codigo.
- O frontend precisa carregar os templates antes de imprimir. Quando o backend nao responde, mantem os dois presets historicos como fallback.
- Migration cria tabela nova `LabelTemplateRecord` com `@@unique` parcial em `(layout, isDefault)` quando `isDefault = true`. Em PostgreSQL, isso e implementado com indice unico parcial via SQL bruto na migration.

## Nao Objetivos

- Nao criar um designer visual de etiqueta (drag-and-drop de campos) nesta fase.
- Nao gerar PDFs de etiqueta no backend; impressao continua via dialogo do navegador.
- Nao implementar mais layouts alem de `kids_checkin` e `visitor`. Layouts de evento, membro etc. ficam para fases futuras.
- Nao adicionar gateway de impressao (LPR/IPP); o Brother e acessado pelo driver instalado.
