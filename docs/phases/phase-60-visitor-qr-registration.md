# Fase 60: Pre-Cadastro De Visitantes Via QR Code

## Objetivo

Dar a igreja uma porta de entrada digital simples: um QR Code na entrada que abre um formulario sem login pra deixar nome e contato. O visitante cai no `PersonProfile` como `visitor` e a equipe consegue dar follow-up via Mensagens (Fase 53).

## Status

Concluida.

## Escopo

### Backend

- Tipo `VisitorRegistrationInput` em `packages/shared`.
- Endpoint publico `POST /public/visitors`:
  - Cria `PersonProfile` com status `visitor`.
  - Sem usuario, sem senha.
  - Audit log `create person` com summary "Visitante via QR".
  - Email de boas-vindas via Resend quando configurado e visitante deu email.
  - Resposta 200 generica.

### Frontend

- Nova rota publica `/visitor` (`VisitorRegistrationPage`).
- Form simples com nome, sobrenome, email, telefone e observacoes.
- Tela de agradecimento apos submit.
- ChurchPage ganha card "QR de pre-cadastro" mostrando o QR + botao Baixar PNG.

### Email

- Boas-vindas: assunto "Bem-vindo a [igreja]"; corpo com mensagem simples + link para Inicio.

## Fora De Escopo

- Vincular ao evento.
- Criar usuario com login.
- Validacao de email.
- Mesclagem de duplicatas.
- LGPD avancado, foto, endereco completo.

## Criterios De Aceite

- POST `/public/visitors` cria pessoa visitor sem login.
- POST sempre retorna 200 com mensagem generica, mesmo dados duplicados.
- Email de boas-vindas chega quando provedor configurado e visitante deu email.
- ChurchPage exibe QR Code clicavel/baixavel apontando para `${WEB_BASE_URL}/visitor`.
- Pagina `/visitor` funciona sem login, sem cookie, em qualquer navegador.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Manual: abrir `/visitor` no celular, preencher e submeter; conferir que aparece em Pessoas com status visitante.

## Proxima Pergunta

Depois desta fase:

> Templates de mensagem com variaveis (Fase 61) ou confirmacao de email no registro publico de eventos?
