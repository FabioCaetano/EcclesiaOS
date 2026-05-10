# Decisao 0110 - Feedback Do Scanner Do Totem Kids

## Contexto

O Totem Kids usa QR Code tanto para carregar o lote de pre-check-in do responsavel quanto para registrar retirada pela etiqueta. A camera pode ler o mesmo QR varias vezes em sequencia.

## Decisao

Aplicar feedback local e deduplicacao curta no Totem Kids:

- sucesso, alerta e erro exibidos visualmente;
- vibracao/som como recurso best-effort;
- mesmo payload ignorado por alguns segundos.

## Consequencias

- Operador recebe resposta imediata da leitura.
- Menos risco de confusao por dupla leitura.
- Nenhuma nova tabela ou migration foi criada.
