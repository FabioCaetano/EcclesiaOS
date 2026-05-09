# 0100 - Totem Kids Autenticado Por Culto

## Contexto

A Fase 99 permitiu que o responsavel logado gerasse check-in infantil para suas criancas. O proximo ponto da experiencia e a operacao no dia do culto: equipe precisa de uma tela simples para ver quem chegou, imprimir etiquetas e registrar retiradas.

## Decisao

Criar uma rota autenticada de totem por evento:

- `/kids-totem/:eventId`;
- acesso restrito a lider/admin;
- aberta a partir do Check-in;
- opera sobre check-ins infantis do evento selecionado;
- imprime etiqueta individual ou lote;
- registra checkout por QR ou manual.

## Motivos

- Separar a tela de operacao infantil da tela administrativa cheia.
- Permitir uso em tablet/celular no balcao de Check-in.
- Manter seguranca inicial exigindo sessao autenticada de operador.

## Consequencias

- O totem ainda nao e uma rota publica.
- O QR atual e de retirada/etiqueta, nao de pre-check-in.
- A proxima fase deve conectar o QR gerado pelo responsavel ao fluxo de entrada no totem.
