# Decisao 0089 - Salas Kids Calculadas No Frontend

## Contexto

O Check-in Kids precisava evoluir para uma operacao mais real, incluindo separacao por sala/faixa etaria e etiqueta com informacao util para a equipe.

## Decisao

Implementar a primeira versao de salas por idade no frontend, usando regras fixas e a data de nascimento da pessoa vinculada a crianca.

## Consequencias

- A funcionalidade fica disponivel sem migration.
- O fluxo pode ser testado imediatamente com os dados atuais.
- Criancas sem data de nascimento ficam como **Sala a definir**.
- Ainda sera necessario criar uma configuracao administravel de salas/faixas etarias em fase futura.
