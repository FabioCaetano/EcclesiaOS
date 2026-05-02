# Fase 37: Aprofundar Inscricoes De Eventos

## Objetivo

Transformar inscricoes de eventos em um fluxo administrativo mais completo, com lista de participantes, confirmacao manual de pagamento, cancelamento e comprovante/ingresso imprimivel.

## Status

Concluida.

## Escopo

- Adicionar contrato `EventRegistrationStatusUpdate`.
- Criar endpoint administrativo `PATCH /event-registrations/:id/status`.
- Permitir confirmar pagamento manualmente.
- Permitir voltar inscricao para pagamento pendente.
- Permitir cancelar inscricao.
- Registrar auditoria ao atualizar inscricao.
- Mostrar participantes do evento selecionado na tela Agenda.
- Filtrar participantes por status.
- Mostrar resumo de confirmados, pendentes, cancelados e valor recebido.
- Gerar recibo/ingresso imprimivel para inscricao selecionada.
- Mostrar comprovante imprimivel apos inscricao publica.

## Fora De Escopo

- Gateway de pagamento online.
- Envio de email automatico.
- QR Code de ingresso.
- Check-in de inscrito por ingresso.
- Reembolso ou conciliacao financeira.

## Criterios De Aceite

- Admin consegue ver participantes de um evento com inscricoes abertas.
- Admin consegue confirmar pagamento manual.
- Admin consegue cancelar inscricao.
- Lista respeita filtro por status.
- Participante recebe comprovante apos inscricao publica.
- Recibo/ingresso pode ser impresso pelo navegador.

## Verificacao

Concluida inicialmente:

```powershell
npm.cmd run build --workspace @ecclesiaos/shared
npm.cmd run typecheck
```

Resultado:

- `typecheck`: concluido.

Validacao consolidada em fases posteriores:

```powershell
npm.cmd run test
npm.cmd run build
```

Resultado consolidado:

- `test`: 19 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao recomendada sera:

> Queremos criar QR Code de ingresso/check-in de participantes ou impressao em lote de etiquetas infantis?
