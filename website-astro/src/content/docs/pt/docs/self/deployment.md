---
slug: pt/docs/self/deployment
title: Implantação self-hosted
sidebar_label: Implantação
description: Implante seu CMS personalizado self-hosted no Firebase Hosting ou em qualquer outro provedor de hospedagem estática.
---

O FireCMS funciona como um **CMS headless** no Firebase. Ele é compilado como uma **single page application** que pode ser implantada em qualquer provedor de hospedagem estática. Não requer código do lado do servidor.

Recomendamos implantar no Firebase Hosting, pois está no mesmo ecossistema e o FireCMS coletará automaticamente a configuração do Firebase a partir do ambiente.


## Implantação no Firebase Hosting

Se você deseja implantar seu CMS no Firebase Hosting, primeiro precisa habilitá-lo na aba Hosting do seu projeto Firebase.

Você precisará inicializar o Firebase, com um projeto existente ou um novo:

```
firebase init
```

:::note
Não é necessário habilitar nenhum dos serviços, exceto o Firebase Hosting se quiser implantá-lo lá.
:::

Você pode vincular o site do Firebase Hosting à aplicação web que criou para obter sua configuração do Firebase.

Para que tudo funcione corretamente, você precisa configurar os redirecionamentos do Firebase Hosting para funcionar como SPA. Seu **firebase.json** deve ser semelhante a isto (lembre-se de substituir `[YOUR_SITE_HERE]`).

```json5
{
  "hosting": {
    "site": "[YOUR_SITE_HERE]",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

```

Depois, basta executar:

```bash
npm run build && firebase deploy --only hosting
```

ou

```bash
yarn run build && firebase deploy --only hosting
```

## Implantar em outras plataformas

Se você deseja implantar seu CMS em outras plataformas, pode compilar com:

```
yarn run build
```

e depois servir a pasta **dist** com seu provedor de hospedagem estática preferido.
