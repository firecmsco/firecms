---
title: Despliegue self-hosted
sidebar_label: Despliegue
description: Despliega tu CMS personalizado self-hosted en Firebase Hosting o cualquier otro proveedor de hosting estático.
---

FireCMS funciona como un **CMS headless** sobre Firebase. Se compila como una **single page application** que puede desplegarse
en cualquier proveedor de hosting estático. No requiere ningún código del lado del servidor.

Recomendamos desplegar en Firebase Hosting, ya que está en el mismo ecosistema, y FireCMS incluso
recogerá la configuración de Firebase del entorno.


## Despliegue en Firebase Hosting

Si deseas desplegar tu CMS en Firebase Hosting, primero necesitas habilitarlo
en la pestaña Hosting de tu proyecto Firebase.

Necesitarás inicializar Firebase, ya sea con un proyecto existente o uno nuevo:

```
firebase init
```

:::note
No necesitas habilitar ninguno de los servicios, además de Firebase Hosting si
deseas desplegarlo allí.
:::

Puedes vincular el sitio de Firebase Hosting a la webapp que has creado
para obtener tu configuración de Firebase.

Para que todo funcione como se espera, necesitas configurar las redirecciones de Firebase Hosting
para funcionar como una SPA. Tu **firebase.json** debería
verse similar a esto (recuerda reemplazar `[YOUR_SITE_HERE]`).

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

Luego simplemente ejecuta:

```bash
npm run build && firebase deploy --only hosting
```

o

```bash
yarn run build && firebase deploy --only hosting
```

para desplegar.

## Desplegar en otras plataformas

Si deseas desplegar tu CMS en otras plataformas, puedes compilarlo
con:

```
yarn run build
```

y luego servir la carpeta **dist** con tu proveedor de hosting estático favorito.

