# Fase 91 - Check-in Kids Dashboard 2

## Objetivo

Continuar o passo combinado de amadurecer Check-in, deixando a administracao infantil mais operacional para o dia do culto.

## Entregue

- Filtro por sala infantil na aba **Kids**.
- Filtro por sala infantil na aba **Administracao kids**.
- Dashboard lateral de salas agora funciona como filtro clicavel.
- Contagem por sala mostra ocupacao/capacidade quando a sala possui capacidade configurada.
- Alertas no painel superior:
  - sala lotada;
  - sala perto do limite;
  - criancas sem sala definida.
- Cards e listas respeitam o filtro de sala selecionado.
- Estados visuais para sala ativa, perto do limite, lotada e selecionada.

## Validacao

- `npm run build:web`: passou.

## Observacoes

- A lotacao ainda e calculada no frontend com base nos check-ins infantis ativos do culto/evento selecionado.
- A capacidade vem da configuracao de salas infantis criada na Fase 90.
- Ainda nao ha bloqueio automatico de check-in quando a sala esta cheia; por enquanto e alerta operacional.
