# Fase 107 - Totem De Check-in De Eventos

## Objetivo

Separar o check-in de participantes de eventos em uma tela operacional propria, parecida com o Totem Kids, para facilitar o uso no dia do evento.

## Entregue

- Nova rota autenticada `/event-totem/:eventId`.
- Botao **Totem evento** dentro da area de inscricoes da Agenda.
- Leitura de QR Code de ingresso por camera.
- Alternancia de camera quando mais de uma estiver disponivel.
- Validacao manual colando o payload do ingresso.
- Check-in manual direto na lista de inscricoes.
- Dashboard com inscricoes, esperados, presentes, ausentes e pendentes.
- Filtros por todos, presentes, ausentes confirmados e status da inscricao.
- Busca por nome, email ou telefone.
- Exportacao CSV do check-in do evento.
- Impressao de relatorio do evento ocultando controles operacionais.

## Decisao De Produto

Eventos pagos ou gratuitos com inscricao passam a ter uma tela de operacao do dia, separada da tela de cadastro/gestao da Agenda. A Agenda continua sendo o lugar de criar evento, configurar inscricao e consultar inscricoes; o Totem Evento vira a tela de entrada do participante.

## Fora De Escopo

- Totem publico sem login.
- Permissao operacional para lideres nao administradores.
- Relatorio historico na aba Relatorios.
- Envio automatico de lista final por email.
- Check-out de eventos, pois eventos nao exigem saida.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.
