# Decisao 0053: Check-in E Escalas Estilo Planning Center

## Status

Aceita.

## Contexto

Apos o feedback "muito confuso" da igreja e o redesign visual nas Fases 47-50, a UI ja melhorou bastante. Mas Check-in e Escalas continuam funcionalmente densos: linhas longas de texto, formularios largos, sem hierarquia clara entre quem esta dentro, quem esta escalado e quem precisa de atencao.

A inspiracao explicita pedida pela igreja e o Planning Center: avatares circulares, status pills coloridos, busca proeminente, cards no lugar de tabelas, sidebars que mostram "o que esta acontecendo agora".

## Decisao

Implementar o "feel" do Planning Center nessas duas telas, sem replicar o produto inteiro. Foco em ganhos visuais que ja temos infra para entregar.

### Primitivos novos

- `Avatar` — circulo com iniciais e cores vindas dos tokens.
- `StatusPill` — variantes `success`, `info`, `warning`, `danger`, `muted` mapeadas para cores semanticas.

### Check-in

- Campo de busca proeminente no topo de cada aba (Eventos, Kids, Administracao kids) que filtra a lista visivel pelo nome.
- Lista de check-ins vira grid de cards com avatar + nome + horario relativo + status pill.
- Aba Administracao kids ganha uma "sidebar" no desktop (vira topo no mobile) chamada "No momento", listando quem esta ativo e ha quanto tempo.
- Status pills:
  - "Ativo" (verde) para crianca ainda no culto;
  - "Saiu" (cinza) para crianca ja retirada;
  - "Aguardando responsavel" (warning) para crianca que ja passou tempo limite (futuro; por enquanto so usa Ativo/Saiu).

### Escalas

- Plano selecionado deixa de ser um formulario denso de linhas; vira "plan view".
- Header do plano com data + titulo + grupo + contagem de pessoas.
- Lista de atribuicoes vira cards com avatar circular, nome, funcao e status pill (Confirmado/Pendente/Recusado).
- Botao "Adicionar pessoa" abre uma linha vazia com seletor de pessoa + funcao; lider so ve pessoas da equipe (ja era assim, mantido).
- Coluna lateral mantem a lista de planos (entrada existente); no mobile vira topo.

## Consequencias

- Ganho visual percebido na operacao do dia a dia.
- Status pills ajudam a bater o olho e ver pendencias.
- Avatares quebram a monotonia de texto puro.
- O codigo fica mais reutilizavel (Avatar e StatusPill viram peca compartilhada).

## Nao Objetivos

- Drag-and-drop de pessoas entre posicoes.
- Foto real (precisa upload + storage; nao temos infra).
- Email/SMS de escalas (precisa provedor).
- Tempo real (websockets).
- "Order of service" com cronometro de itens.
- Multi-week matrix view de equipes.
- Block-out dates por pessoa.
- Mudar logica de Check-in ou Escalas; apenas estrutura visual.
