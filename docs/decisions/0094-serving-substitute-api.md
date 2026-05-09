# 0094 - Rota Dedicada Para Aplicar Substituto

## Contexto

Na fase anterior, a tela de Escalas passou a permitir aplicar substituto rapidamente, mas essa acao ainda reutilizava o endpoint generico de salvar plano. Isso funcionava, mas misturava uma operacao pontual com a edicao completa da escala.

## Decisao

Criar uma rota dedicada para aplicar substituto em uma atribuicao especifica:

`PATCH /serving-plans/:planId/assignments/:assignmentId/substitute`

## Motivos

- Reduzir risco de sobrescrever outros campos do plano.
- Centralizar validacoes de substituicao no backend.
- Permitir auditoria especifica.
- Permitir notificacao ao substituto sem depender do fluxo generico de salvar escala.
- Preparar o sistema para regras futuras, como motivo de substituicao e aprovacao.

## Consequencias

- O frontend fica mais simples e mais seguro para a acao **Aplicar e salvar**.
- Lider/admin recebem uma operacao mais proxima do uso real.
- O proximo passo pode evoluir a experiencia visual da substituicao, exibindo resultado de email/auditoria para o lider.
