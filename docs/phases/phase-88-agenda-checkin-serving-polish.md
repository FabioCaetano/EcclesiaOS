# Fase 88 - Polimento de Agenda, Ambientes, Check-in e Escalas

## Objetivo

Atender o bloco de evolucao priorizado para os passos 2, 3, 4 e 5: melhorar Agenda/Ambientes, manter Liturgia separada e mais integrada ao Culto, amadurecer Check-in e reforcar regras de Escalas.

## Entregue

- Agenda passa a gerar ocorrencias automaticamente ao salvar evento recorrente.
- Lista da Agenda troca a leitura de local para **Ambiente**.
- Ambientes agora separa visualmente **Cadastro de ambientes** e **Reservas** por abas internas.
- Escalas permite criacao por lider, limitada as equipes que ele lidera.
- API bloqueia criacao de escala por membro.
- API valida que lider so cria escala para sua propria equipe e so escala membros daquela equipe.
- Frontend de Escalas libera fluxo de criacao para lider e mantem membro apenas para resposta/indisponibilidade.

## Validacao

- `npm run build:api`: passou.
- `npm run build:web`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.

## Observacoes

- Check-in ja estava com separacao interna entre Eventos, Kids, Administracao kids e Etiquetas. Esta fase manteve esse desenho e priorizou estabilidade, permissao e fluxo.
- A configuracao de salas por idade no Kids continua como proximo incremento especifico.
