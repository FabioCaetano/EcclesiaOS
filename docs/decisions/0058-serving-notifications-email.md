# Decisao 0058: Notificacoes De Escala Por Email

## Status

Aceita.

## Contexto

A Fase 45 entregou Escalas com confirmacao propria. A Fase 55 plugou o Resend. Hoje a unica notificacao de escala e o painel interno de pendencias (Fase 11). Falta o passo natural: avisar a pessoa por email quando ela for escalada e avisar o lider quando alguem responde (especialmente recusa).

## Decisao

Disparar dois tipos de email a partir do servidor, usando o servico Resend ja configurado:

1. **Nova atribuicao** — quando um plano e atualizado e ganha uma atribuicao para um `personId` que nao estava no plano antes, enviar email para a pessoa com:
   - Assunto: "Voce foi escalado em [titulo do plano]"
   - Corpo: data, funcao, observacoes opcionais, instrucao para confirmar ou recusar dentro do sistema.

2. **Resposta do voluntario** — quando uma atribuicao muda de status (confirmed/declined), enviar email ao lider da equipe (`group.leaderPersonId` com vinculo `personId`), com:
   - Assunto: "[Nome] [confirmou|recusou] a escala de [titulo]"
   - Corpo: data, funcao, contexto.

Quando o provedor de email nao esta configurado (`isEmailConfigured()` retorna false), os disparos sao silenciosamente ignorados — o fluxo de salvamento da escala continua funcionando.

Quando a pessoa nao tem email cadastrado, o email simplesmente nao e enviado para ela; o lider continua avisado normalmente.

## Consequencias

- A pessoa escalada para de depender de mensagens manuais; recebe um aviso na hora.
- O lider acompanha as respostas da equipe sem precisar abrir a tela de Escalas.
- Cada send e best-effort: falha de envio nao quebra o salvamento da escala.
- Audit log nao registra cada email; ja audita a alteracao do plano e da atribuicao.
- Sem provedor configurado, comportamento permanece igual.

## Nao Objetivos

- Templates HTML elaborados; corpo simples (texto + html minimo).
- Botoes de "confirmar/recusar" que clicam direto via link unico (precisaria de tokens proprios; fica para fase futura).
- SMS.
- Reenviar lembretes proximos da data do servico.
- Notificacao quando o admin remove uma pessoa da escala (so quando adiciona).
- Email automatico quando substituto e aplicado (a sugestao de substituto da Fase 54 entra como nova atribuicao para a pessoa, entao o email cai naturalmente).
