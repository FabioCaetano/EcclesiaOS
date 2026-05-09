# Decisao 0090 - Salas Infantis Como Configuracao Do Check-in

## Contexto

A Fase 89 criou sugestao de sala por idade no frontend, mas as regras estavam fixas no codigo. Para teste real, a igreja precisa ajustar faixas etarias, capacidade e responsaveis sem alterar codigo.

## Decisao

Criar `KidsRoom` como entidade propria, persistida em Prisma/JSON e administrada dentro da propria aba Check-in, em uma subaba **Salas**.

## Consequencias

- O ministerio infantil passa a ter configuracao operacional propria.
- O calculo de sala continua simples e previsivel: idade da pessoa vinculada a crianca contra faixas ativas.
- O dashboard e as etiquetas seguem a mesma fonte de dados da configuracao.
- Futuras fases podem adicionar alerta de lotacao, turmas por culto e permissao por responsavel de sala.
