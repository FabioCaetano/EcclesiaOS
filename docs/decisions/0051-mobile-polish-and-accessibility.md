# Decisao 0051: Polimento Mobile E Acessibilidade

## Status

Aceita.

## Contexto

As Fases 47, 48 e 49 entregaram o redesign visual do produto inteiro. Restam ajustes finos especificos de mobile e acessibilidade que so aparecem quando o app e usado em campo:

- iOS Safari: `100vh` nao considera a barra de URL e pode causar overflow.
- iOS: inputs com `font-size < 16px` provocam zoom automatico no foco, atrapalhando o cadastro.
- Touch: botoes pequenos (32-36px) ficam dificeis de acertar com o dedo.
- Hover em touch: o estilo `:hover` "gruda" no primeiro toque, parecendo bug.
- Drawer aberto: a pagina debaixo continua rolando.
- Acessibilidade: navegacao por teclado nao tem skip link nem `aria-current`.

## Decisao

Resolver tudo isso em uma fase CSS-first, sem mexer em logica nem features:

1. Substituir `100vh` por `100dvh` no shell (mantem fallback `100vh` antes).
2. Ao abrir o drawer, travar o scroll do body via classe.
3. Aumentar altura minima de botoes e inputs em mobile (`min-height: 44px`).
4. Forcar `font-size: 16px` nos campos em telas mobile para impedir zoom do iOS.
5. Adicionar `-webkit-tap-highlight-color: transparent` na raiz e gerenciar feedback via `:active`.
6. Escopo de `:hover` para `@media (hover: hover)`.
7. Reduzir `padding` dos `Card` em mobile.
8. Adicionar skip link no `AppLayout` que pula para o conteudo principal.
9. `aria-current="page"` no item de navegacao ativo.
10. Reforcar foco visivel via `:focus-visible` nos itens de nav.

## Consequencias

- iPhone deixa de "pular" quando o usuario toca em campos.
- Botoes ficam acionaveis sem precisar mirar.
- Drawer aberto fica estavel.
- Navegacao por teclado fica utilizavel para leitores de tela.

## Nao Objetivos

- Nao introduzir novos componentes ou features.
- Nao mexer em endpoints, dados ou regras.
- Nao tentar acessibilidade WCAG 2.1 AA completa nesta fase; foco no caminho operacional comum.
- Nao trocar para uma lib de UI.
- Nao introduzir testes automatizados de acessibilidade.
