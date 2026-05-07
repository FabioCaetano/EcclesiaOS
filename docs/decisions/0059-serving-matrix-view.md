# Decisao 0059: Matrix View De Equipes Em Escalas

## Status

Aceita.

## Contexto

A pagina de Escalas hoje tem dois modos de uso: lista de planos (a esquerda) e edicao do plano selecionado (a direita). Para um lider de equipe, falta a visao panoramica: "quem da minha equipe esta escalado nas proximas 8 semanas, e como esta o status?". E o que o Planning Center chama de "Matrix view".

A informacao ja existe (planos da Fase 45 + atribuicoes + status), so falta uma visao que cruze.

## Decisao

Adicionar um terceiro modo na ServingPage: tab bar com **Lista** (atual) e **Matriz** (novo). Sem nova pagina, sem mudar endpoints, sem nova entidade.

### Funcionamento

- Filtro de equipe (grupo do tipo `ministry` ou `team`).
- Filtro de janela: 4, 8 ou 12 semanas a partir de hoje.
- Tabela:
  - Cabecalho: data + titulo do plano (ordenados por data).
  - Linhas: todos os membros atuais da equipe (`group.memberPersonIds`).
  - Cada celula mostra a `StatusPill` da atribuicao da pessoa naquele plano (ou vazio quando nao escalada).
- Tabela e horizontalmente rolavel; primeira coluna (nome) fica fixa em telas largas.

### Permissoes

- Mantem as mesmas regras existentes de leitura de planos (`/serving-plans` autenticado).
- Frontend filtra para `ministry`/`team`, mas usuarios membros normais ja veem somente onde tem visibilidade.
- Lider so ve planos da propria equipe via filtro client-side; para resgate via API o backend continua retornando os planos visiveis.

## Consequencias

- Lider tem visao panoramica imediata da equipe.
- Reaproveita endpoints e dados ja existentes; sem nova migration.
- Tabela horizontal escala bem ate ~12 semanas; alem disso fica visualmente cansativo (limite explicito de 12).

## Nao Objetivos

- Edicao inline a partir da matrix (ainda exige clicar em plano e ir para a aba Lista).
- Multiplas equipes lado a lado.
- Carga total por pessoa em mais de 12 semanas.
- Heatmap por carga.
- Exportacao CSV.
- Drag and drop entre celulas.
