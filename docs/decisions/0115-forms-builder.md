# Decisao 0115: Builder De Formularios

## Status

Aceita.

## Contexto

A pagina Formularios da Fase 76 entregou cadastro, link publico e relatorios, mas o editor de campos cresceu organicamente como uma lista vertical de cards expandidos. Em formularios de 8+ campos isso vira uma tela rolavel que dificulta entender a estrutura. As opcoes de campo do tipo `select` sao guardadas no contrato como `string[]`, mas o editor concatena com virgula e mostra um unico input texto, o que e fragil quando uma opcao contem virgula ou espacos. Responsaveis usam checkbox com a lista inteira de pessoas. Nao ha reordenacao nem preview do que o publico ve.

## Decisao

Reformatar so o frontend de `FormsPage`, sem mudar contrato compartilhado nem banco. Reaproveitar tecnicas das Fases 113 e 114.

- Cada campo do formulario vira uma **linha** em grid horizontal: `[label] [tipo] [obrigatorio] [↑] [↓] [X]`. Quando `type === "select"`, abaixo da linha aparece a sublist de **chips de opcoes** (um `<input>` por opcao com botao `+` e X).
- **Reordenacao** por botoes ↑/↓ que trocam `order` com vizinho imediato. Sem drag-and-drop pra evitar nova dependencia.
- **Responsaveis pesquisaveis**: `<input list="people-options">` + `<datalist>`; selecionados aparecem como chips removiveis acima do input.
- **Preview**: card colapsavel que renderiza o formulario do jeito que o publico vai ver, usando os mesmos tipos de input do `PublicCustomFormPage`.
- **Configuracoes** (slug, link publico, lista de responsaveis em texto) ficam num bloco recolhivel para nao poluir o topo.
- Permissoes seguem `canManageModule(user.role, "forms")` — sem mudanca.

## Consequencias

- Formularios com 10+ campos ficam visiveis numa unica tela.
- Edicao de opcoes vira chips claros, evitando confusao com virgulas.
- Selecionar responsavel funciona em qualquer tamanho de igreja.
- Preview ajuda autor a confirmar o resultado antes de publicar.
- Zero alteracao em backend, Prisma ou shared.

## Nao Objetivos

- Drag-and-drop para reordenar campos.
- Tipos de campo novos (radio, escala, arquivo).
- Logica condicional ("se A entao mostre B").
- Templates de formulario.
- Validacao avancada (regex, faixa numerica).
- Editor multipaginas/secoes.
