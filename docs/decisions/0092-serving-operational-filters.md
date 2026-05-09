# 0092 - Escalas Com Filtros Operacionais E Substituto Rapido

## Contexto

A aba **Escalas** ja permitia criar planos, responder convites, registrar indisponibilidade e sugerir substitutos. Porem, a visualizacao ainda ficava poluida para lideres e membros, principalmente quando havia muitos cultos, equipes e atribuições.

## Decisao

Iniciar o amadurecimento da tela com filtros operacionais no frontend e uma acao rapida para aplicar substituto sugerido.

Foram mantidos dois caminhos para substituicao:

- **Escalar**: altera o rascunho do formulario, permitindo revisao antes de salvar.
- **Aplicar e salvar**: troca a pessoa escalada pelo substituto e persiste imediatamente.

## Motivos

- Reduzir ruido visual antes de mexer em modelo de dados.
- Dar ao lider uma forma direta de resolver recusas.
- Preservar o fluxo manual para casos em que o lider queira revisar a escala completa.
- Evitar nova API nesta etapa, usando o endpoint de salvar plano ja existente.

## Consequencias

- A tela fica mais operacional para uso real.
- A substituicao rapida ainda depende do endpoint generico de plano de escala.
- Uma fase futura pode criar uma rota dedicada para substituicao, registrando auditoria, notificacao e motivo.
