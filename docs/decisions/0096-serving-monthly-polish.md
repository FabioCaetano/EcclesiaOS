# 0096 - Fechamento Do Passo 5 De Escalas

## Contexto

A visao mensal criada na Fase 95 ja permitia acompanhar a equipe por mes, mas ainda faltavam acoes praticas para o lider: identificar sobrecarga, exportar, imprimir e entender se o substituto foi notificado.

## Decisao

Adicionar polimentos de operacao diretamente no frontend, sem criar nova API:

- criterio visual de alta carga;
- exportacao CSV;
- impressao;
- mensagem de resultado da notificacao ao aplicar substituto.

## Motivos

- Lideres precisam revisar a escala mensal fora do sistema em alguns contextos.
- Sobrecarga mensal ajuda a distribuir melhor o servico.
- O retorno da notificacao evita ambiguidade depois de aplicar um substituto.

## Consequencias

- O Passo 5 fica funcionalmente fechado para a primeira versao.
- Exportacao e impressao ainda sao simples e podem evoluir para layout proprio.
- O proximo ciclo pode retomar Culto operacional ou Check-in Eventos.
