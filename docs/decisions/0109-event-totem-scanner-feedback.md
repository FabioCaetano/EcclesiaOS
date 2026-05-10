# Decisao 0109 - Feedback Do Scanner Do Totem Evento

## Contexto

Leitores por camera podem disparar multiplas leituras do mesmo QR Code em poucos segundos. No uso real, isso confunde o operador e pode gerar mensagens repetidas.

## Decisao

Adicionar uma camada local no Totem Evento para:

- ignorar leitura repetida do mesmo payload por uma janela curta;
- mostrar feedback visual por tipo de resultado;
- acionar vibracao/som como recurso best-effort.

## Consequencias

- A operacao fica mais clara no balcão.
- O backend continua idempotente e seguro pelo `ticketCode`.
- A deduplicacao e local ao totem e nao cria nova tabela ou migration.
