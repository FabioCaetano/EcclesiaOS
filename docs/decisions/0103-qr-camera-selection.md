# 0103 - QR Scanner Com Camera Selecionavel

## Contexto

O feedback apontou que a camera do celular abria em uma orientacao fixa, dificultando o uso no check-in. O hook atual sempre tentava `facingMode: environment`, sem dar controle ao operador.

## Decisao

Evoluir o hook `useQrScanner` para:

- enumerar cameras com `navigator.mediaDevices.enumerateDevices`;
- expor a lista de cameras;
- permitir selecionar um `deviceId`;
- alternar para a proxima camera disponivel;
- manter tentativa inicial de camera traseira.

## Motivos

- O mesmo leitor e usado em Check-in Kids, Totem Kids e ingressos de eventos.
- Centralizar a melhoria evita divergencia entre telas.
- Operadores usando celular/tablet precisam alternar frontal/traseira rapidamente.

## Consequencias

- A lista de cameras so aparece depois que o navegador concede permissao.
- Trocar camera reinicia o stream atual.
- Podemos persistir a camera preferida em fase futura.
