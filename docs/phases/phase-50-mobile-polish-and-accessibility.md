# Fase 50: Polimento Mobile E Acessibilidade

## Objetivo

Resolver atritos especificos do uso em smartphone (iOS Safari), tornar areas tocaveis confortaveis e dar suporte basico de navegacao por teclado/leitor de tela.

## Status

Concluida.

## Escopo

- `100vh` -> `100dvh` com fallback no shell.
- Lock de scroll do body quando o drawer esta aberto.
- `min-height` de 44px em botoes e inputs em mobile.
- `font-size: 16px` em campos no mobile para evitar zoom do iOS.
- `-webkit-tap-highlight-color: transparent` na raiz; `:active` cuida do feedback.
- `:hover` sob `@media (hover: hover)` para nao "grudar" no touch.
- Card com padding reduzido no mobile.
- Skip link no `AppLayout`.
- `aria-current="page"` no item ativo da sidebar.
- `:focus-visible` reforcado em navegacao.

## Fora De Escopo

- Conformidade WCAG completa.
- Bottom navigation (decidido na Fase 47 manter drawer).
- Refatoracao de componentes para garantir A11y profunda.
- Mudancas de logica.

## Criterios De Aceite

- iPhone Safari: ao tocar em um input, a pagina nao da zoom.
- Drawer aberto: scroll de fundo bloqueado.
- Botoes principais ficam confortaveis para acionar com o dedo.
- Tab/shift+tab navega pelos itens da sidebar com foco visivel.
- Skip link funciona ao primeiro Tab.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Inspecao manual em iPhone (ou Chrome DevTools mobile) e em desktop com teclado.

## Proxima Pergunta

Depois desta fase:

> Mensagens em lote em Pessoas, troca de senha ou outra feature operacional?
