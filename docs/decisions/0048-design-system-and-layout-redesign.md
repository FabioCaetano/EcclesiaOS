# Decisao 0048: Sistema De Design E Redesenho Do Layout

## Status

Aceita.

## Contexto

Apos a apresentacao do EcclesiaOS para a igreja, o feedback claro foi que a UI esta confusa. Os formularios sao densos, a navegacao por estado interno mistura paginas, o desktop nao usa bem o espaco disponivel e o mobile espreme campos lado a lado. A inspiracao trazida foi o Planning Center (limpo, hierarquico, ocorre por modulos e ao mesmo tempo deixa cada modulo respirar).

Hoje:

- `styles.css` cresceu organicamente sem tokens.
- `AppLayout` empilha botoes de modulo no topo, sem sidebar real.
- Nao ha primitivos reutilizaveis (cada pagina monta sua propria estrutura).
- Sem icones — tudo texto.
- Sem media queries consistentes.

## Decisao

Refazer o sistema de design e o layout principal antes de tocar qualquer feature nova:

### Tokens

Definir variaveis CSS na raiz cobrindo:

- Cores: `--color-brand`, `--color-brand-soft`, `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, e semanticas (`--color-success`, `--color-warning`, `--color-danger`, `--color-info`).
- Espacamento: escala `--space-1` ate `--space-12` (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96).
- Tipografia: `--font-sans`, `--text-xs`/`--text-sm`/`--text-base`/`--text-lg`/`--text-xl`/`--text-2xl`/`--text-3xl`, e pesos.
- Sombras: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- Bordas: `--radius-sm` (4), `--radius-md` (8), `--radius-lg` (12), `--radius-pill`.

### Layout principal

- Header fixo (56px) com logo e nome da igreja a esquerda; perfil e logout a direita.
- Sidebar fixa (240px) no desktop, com nome do modulo e icone, agrupando modulos por dominio (Operacao, Cadastros, Sistema).
- No mobile (largura < 768px), sidebar some e da lugar a uma bottom navigation com 5 modulos principais (Inicio, Agenda, Check-in, Pessoas, Mais). "Mais" abre uma drawer com as demais areas.
- Conteudo central com padding generoso (`--space-8` no desktop, `--space-4` no mobile) e largura maxima coerente.

### Primitivos

Criar componentes em `apps/web/src/ui/`:

- `PageHeader` — eyebrow opcional, h1, descricao, slot de acoes.
- `Card` — container com borda + sombra + padding consistentes.
- `EmptyState` — icone + titulo + texto + acao opcional.
- `Button` — variantes `primary`, `secondary`, `ghost`, `danger`; tamanhos `sm`, `md`; suporte a `Icon` opcional.
- `Stack` / `Cluster` — utilitarios de espacamento (vertical/horizontal).

### Aplicacao

Esta fase aplica o novo design em quatro telas criticas:

- Inicio (painel operacional)
- Igreja (cadastro + Etiquetas)
- Pessoas (CRUD)
- Agenda (eventos + inscricoes + check-in de ingresso)

As demais telas (Check-in, Calendario, Escalas, Financeiro, Ambientes, Usuarios, Auditoria) recebem automaticamente os tokens (cores, fontes, botoes) mas mantem layout estrutural antigo. Refinamento entra em fases proprias (48 e 49).

### Bibliotecas

Adicionar `lucide-react` (~10KB tree-shaken, MIT) para icones. Sem icones, a percepcao de qualidade trava num teto baixo. Manter CSS puro com variaveis — nao adotar Tailwind, Material UI ou shadcn nesta fase para nao multiplicar complexidade.

## Consequencias

- O CSS principal e reescrito; layouts antigos podem precisar de ajustes finos.
- A navegacao por estado interno permanece (sem React Router nesta fase) para evitar refatoracao paralela.
- O bundle web cresce com `lucide-react` (mas tree-shake mantem pequeno, ja que importamos icones individuais).
- O salto visual e percepcional sera grande nas 4 telas criticas; as demais ficam visivelmente diferentes mas com o layout antigo, e devem ser tratadas em sequencia.
- Mobile fica usavel para a equipe operacional da igreja.

## Nao Objetivos

- Nao trocar por uma lib de UI.
- Nao introduzir dark mode.
- Nao fazer animacoes alem de transicoes simples.
- Nao mudar React Router.
- Nao mexer em endpoints, dados ou logica de negocio.
- Nao tentar refazer todas as telas em uma unica fase.
