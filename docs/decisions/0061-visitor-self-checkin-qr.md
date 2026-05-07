# Decisao 0061: Pre-Cadastro De Visitantes Via QR Code

## Status

Aceita.

## Contexto

A Fase 32 (Registro Publico) cobre o caso "visitante quer criar conta com login". Mas, na entrada do culto, a maioria dos visitantes nao quer criar senha — querem so deixar o nome e o contato pra equipe da igreja entrar em contato. Hoje o atendente faz isso a mao. A Fase 53/55 ja permite a igreja se comunicar; falta a porta de entrada simples.

## Decisao

Criar um fluxo publico ainda mais leve, voltado para o operador imprimir um QR Code e deixar na recepcao:

- Endpoint publico `POST /public/visitors` recebe `{ firstName, lastName, email, phone, notes }` e cria `PersonProfile` com `status: "visitor"`. Nao cria `UserRecord` nem senha.
- Resposta sempre 200 com mensagem generica para nao vazar quem ja esta cadastrado nem quebrar o fluxo do visitante.
- Quando provedor de email esta configurado e o visitante informou email, dispara email de boas-vindas com nome da igreja, link para o site/YouTube se cadastrados, e mensagem simples.
- Audit log registra `create person` com summary "Visitante via QR".

### Pagina publica

Nova rota `/visitor` no frontend:
- Sem autenticacao.
- Form responsivo com nome (obrigatorio), sobrenome, email, telefone e "como conheceu" (opcional).
- Apos submit, tela de agradecimento com nome da igreja.
- Layout reaproveita o `auth-shell` ja usado em login/registro/forgot.

### QR Code

ChurchPage ganha secao "QR de pre-cadastro" com:
- Renderizacao do QR Code apontando para `${WEB_BASE_URL}/visitor` usando o pacote `qrcode` ja instalado no frontend.
- Botao "Baixar PNG" para baixar a imagem em alta resolucao.
- Mensagem orientando imprimir e colocar na entrada.

## Consequencias

- Igreja consegue tirar do papel uma porta de entrada digital sem precisar treinar atendente.
- Visitante nao precisa criar senha — fluxo de 3 cliques.
- Dados ja entram no `PersonProfile` e a equipe pode usar Mensagens em Lote (Fase 53) com filtro "visitantes recem-cadastrados".
- Nao usa nada novo de infra; reaproveita Resend (Fase 55) para boas-vindas e `qrcode` (Fase 38) para o QR.

## Nao Objetivos

- Nao integrar com evento especifico (a Fase 28 ja faz inscricao publica por evento).
- Nao criar usuario com login.
- Nao validar email com confirmacao por link.
- Nao bloquear duplicatas; admin pode mesclar/limpar depois (a entrada sempre cria nova pessoa).
- Nao incluir foto, endereco completo ou consentimento LGPD detalhado nesta fase.
- Nao criar QR Code por equipe ou ministerio.
