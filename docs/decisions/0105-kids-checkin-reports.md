# 0105 - Relatorio Kids No Totem

## Contexto

O Totem Kids ja permite operar entrada, etiquetas e retirada. Para fechar o ciclo do culto, a equipe precisa consultar e exportar o que aconteceu naquele evento.

## Decisao

Criar o primeiro relatorio diretamente no Totem Kids, usando os dados ja carregados no frontend:

- resumo visual;
- exportacao CSV;
- impressao da visao de relatorio.

## Motivos

- Evita criar backend novo antes de validar o formato do relatorio.
- Atende a necessidade imediata de conferencia pos-culto.
- Mantem a informacao no contexto operacional do evento.

## Consequencias

- O relatorio ainda e por culto aberto no Totem.
- A aba Relatorios pode receber uma versao historica depois.
- CSV e impressao sao simples e podem evoluir para PDF/layout proprio.
