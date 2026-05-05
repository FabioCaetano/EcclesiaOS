# Fase 47: Sistema De Design E Redesenho Do Layout

## Objetivo

Resolver o feedback "muito confuso" trazido pela igreja apos a apresentacao. Criar tokens consistentes, layout responsivo proximo do Planning Center e aplicar o novo design nas quatro telas criticas (Inicio, Igreja, Pessoas, Agenda). Demais telas herdam tokens nesta fase e sao refinadas em fases seguintes.

## Status

Concluida.

## Escopo

### Tokens e fundacao

- Variaveis CSS na raiz: cores, espacamento, tipografia, sombras, bordas.
- Reset coerente (box-sizing, font-family base, smoothing).
- Paleta com branco como base, cinzas neutros e verde EcclesiaOS como acento.

### Layout principal

- Header fixo (56px) com identidade da igreja a esquerda e perfil/logout a direita.
- Sidebar 240px no desktop com modulos agrupados (Operacao, Cadastros, Sistema).
- Bottom navigation no mobile (`< 768px`) com 5 modulos chave + drawer "Mais".
- Conteudo com padding e largura maxima coerentes.

### Primitivos UI em `apps/web/src/ui/`

- `PageHeader`
- `Card`
- `EmptyState`
- `Button` (variantes primary/secondary/ghost/danger, sizes sm/md, icone opcional)
- Utilidades de layout (Stack/Cluster)

### Icones

- Adicionar `lucide-react` e usar icones inline em sidebar, page headers, botoes principais.

### Aplicacao em 4 telas

- Inicio: hero compacto, cards de KPI redesenhados, bloco YouTube com cards menores e mais legiveis.
- Igreja: formulario em duas colunas no desktop, cards das etiquetas com estados claros.
- Pessoas: lista lateral + detalhes com formulario respiravel; estado vazio amigavel.
- Agenda: lista de eventos com cards, formulario lateral, painel de inscricoes em card.

### Demais telas

- Recebem automaticamente os novos tokens (botoes, fontes, cores).
- Layouts antigos sao mantidos.
- Ajustes finos ficam para fases 48 e 49.

## Fora De Escopo

- Trocar por Tailwind / Material UI / shadcn / Mantine.
- Dark mode.
- React Router.
- Animacoes elaboradas.
- Modificar endpoints, dados ou regras.
- Refazer Check-in, Calendario, Escalas, Financeiro, Ambientes, Usuarios, Auditoria nesta fase (entram nas proximas).

## Criterios De Aceite

- O site abre limpo, com cabecalho e navegacao laterais no desktop, e bottom nav no mobile.
- Os botoes possuem hierarquia visual clara (primario verde, secundario neutro, perigo vermelho).
- Inicio, Igreja, Pessoas e Agenda mostram cards com sombra sutil, padding generoso e tipografia hierarquica.
- A largura mobile (< 768px) reorganiza formularios em coluna unica sem quebrar texto.
- Demais telas continuam funcionais com a nova paleta e tipografia mesmo sem refactor estrutural.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Mais inspecao manual em desktop largo, tablet, mobile portrait.

## Proxima Pergunta

Depois desta fase:

> Refinar Check-in, Calendario e Escalas com o novo design (Fase 48), ou priorizar uma feature nova?
