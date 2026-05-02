# Fase 36: Leitura De QR Code E Etiquetas Brother

## Objetivo

Aprofundar o fluxo de retirada infantil com leitura de QR Code pela camera e preparar impressao de etiquetas infantis em impressoras Brother por meio do driver do sistema.

## Status

Concluida.

## Escopo

- Adicionar painel de leitura de QR Code na tela Check-in.
- Usar `BarcodeDetector` do navegador quando disponivel.
- Manter campo manual para colar/digitar o conteudo do QR Code quando a camera nao estiver disponivel.
- Ler payload `ecclesiaos-child-checkout:<checkInId>:<securityCode>`.
- Validar e registrar retirada usando o mesmo endpoint seguro de checkout.
- Adicionar presets de etiqueta Brother:
  - `Brother DK-1202 62x100mm`;
  - `Brother 62mm continuo`.
- Criar CSS de impressao em milimetros com `@page 62mm 100mm`.
- Isolar a etiqueta na impressao do navegador.

## Fora De Escopo

- Integracao nativa com SDK Brother.
- Impressao silenciosa sem dialogo do navegador.
- Instalador/configurador de driver Brother.
- Leitura de QR Code em navegadores sem suporte a `BarcodeDetector`, alem do fallback manual.
- Impressao em lote.

## Criterios De Aceite

- Operador pode abrir a camera na tela Check-in.
- Sistema tenta ler QR Code da etiqueta infantil.
- Usuario pode colar manualmente o payload do QR Code se a camera nao funcionar.
- Ao validar QR Code, o checkout infantil usa o codigo de seguranca.
- Etiqueta possui formato de impressao compativel com Brother 62mm.

## Verificacao

Concluida inicialmente:

```powershell
npm.cmd run typecheck
```

Resultado:

- `typecheck`: concluido.

Validacao consolidada em fases posteriores:

```powershell
npm.cmd run test
npm.cmd run build
```

Resultado consolidado:

- `test`: 19 testes API passando.
- `build`: concluido.

## Observacoes De Uso

Para imprimir em Brother:

1. Abrir uma etiqueta infantil.
2. Selecionar o preset Brother desejado.
3. Clicar em `Imprimir Brother`.
4. No dialogo do navegador, escolher a impressora Brother e o papel correspondente no driver.

## Proxima Pergunta

Depois desta fase, a proxima decisao recomendada sera:

> Queremos aprofundar inscricoes de eventos ou criar impressao em lote de etiquetas?
