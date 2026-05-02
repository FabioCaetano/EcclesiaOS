# Fase 10: Escalas E Cultos

## Objetivo

Criar a primeira versao de planos de servico/culto com escala de pessoas por funcao.

## Escopo

- Contratos compartilhados de plano de servico.
- Persistencia local de planos.
- Endpoint para listar planos.
- Endpoint para criar plano.
- Endpoint para atualizar plano.
- Endpoint para remover plano.
- Pagina Escalas no painel.

## Fora De Escopo

- Ordem detalhada de culto.
- Musicas.
- Confirmacao de voluntarios.
- Notificacoes.
- Disponibilidade e bloqueios.
- Impressao.

## Criterios De Aceite

- A API lista planos.
- Um admin consegue criar plano.
- Um admin consegue editar plano.
- Um admin consegue remover plano.
- Um admin consegue escalar pessoas por funcao.
- Lider e membro conseguem visualizar planos.
- Lider e membro nao conseguem alterar planos.

## Verificacao

- `npm.cmd run build --workspace @ecclesiaos/shared`: concluido.
- `npm.cmd run typecheck`: concluido.

Build completo e validacao de endpoints reais permanecem pendentes enquanto houver bloqueio de execucao elevada no ambiente.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos estabilizar com testes automatizados ou aprofundar Escalas com confirmacao de voluntarios?
