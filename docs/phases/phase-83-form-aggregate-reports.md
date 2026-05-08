# Fase 83 - Relatorios Agregados De Formularios

## Objetivo

Transformar respostas de formularios em indicadores operacionais simples, para que o administrador ou lider consiga acompanhar volume, atividade recente e preenchimento por campo sem exportar tudo manualmente.

## Entregue

- Indicadores gerais de formularios, ativos, respostas totais e respostas dos ultimos 7 dias.
- Ranking dos formularios por volume de respostas.
- Card de atividade recente com ultima resposta, formulario relacionado e taxa de formularios ativos.
- Relatorio do formulario selecionado com:
  - respostas filtradas;
  - total de respostas;
  - quantidade de campos;
  - preenchimento medio;
  - preenchidas/vazias por campo;
  - respostas unicas por campo;
  - respostas mais comuns por campo.
- Exportacao CSV especifica para relatorio agregado do formulario.
- Exportacao CSV de respostas continua disponivel e respeita os filtros aplicados.

## Decisoes De Escopo

- A fase foi implementada no frontend usando `CustomForm` e `CustomFormResponse` ja existentes.
- Nenhuma migration Prisma foi necessaria.
- Nenhum novo endpoint foi criado.
- Os filtros existentes de busca e periodo continuam sendo a base do recorte exibido e exportado.

## Validacao

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: builds passaram e a API passou com 40 testes.

## Proximas Evolucoes

- Melhorar construtor de campos com reordenacao visual.
- Registrar status de entrega das notificacoes dos formularios.
- Criar graficos visuais para campos de selecao.
- Permitir salvar visoes/relatorios favoritos por formulario.
