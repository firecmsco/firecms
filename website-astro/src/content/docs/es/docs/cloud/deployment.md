---
title: "Desplegando tu CMS de Firebase y UI de Administración"
slug: es/docs/cloud/deployment
sidebar_label: Despliegue
description: "Despliega el código personalizado de tu CMS en React y panel de administración en FireCMS Cloud. Alojamiento totalmente administrado para tu sistema de gestión de contenido de Firestore."
---

## Despliegue en FireCMS Cloud

FireCMS es único entre los CMS en el sentido de que permite subir código personalizado a
su versión Cloud. Esta es una característica muy avanzada que te permite adaptar
el CMS a tus necesidades.

El código se empaqueta y compila utilizando **module federation** y
**vite**. Esto significa que puedes usar cualquier paquete npm que desees para construir tu CMS.
El paquete final no incluirá ninguna de las dependencias que ya están
incluidas en FireCMS, por lo que puedes usar cualquier versión de cualquier paquete.

Despliega tu código en [FireCMS Cloud](https://app.firecms.co) con un solo comando,
y será alojado desde allí:

```bash
npm run deploy
```

o

```bash
yarn deploy
```

La ventaja de este enfoque es que puedes utilizar cualquier paquete npm que necesites,
y puedes utilizar la última versión de FireCMS sin tener que actualizar
tu código manualmente.

### FireCMS CLI

La CLI de FireCMS es una herramienta que te permite desplegar tu CMS en FireCMS Cloud
con un solo comando. En tu proyecto, debes tener `firecms` como una dependencia
de desarrollo (`dev dependency`). Este paquete era anteriormente `@firecms/cli`.

Los comandos disponibles son:

```bash
firecms login
```

```bash
firecms logout
```

y

```bash
firecms deploy --project=tu-id-de-proyecto
```

## Importar Firebase en tu código

FireCMS Cloud proporciona React, los paquetes de FireCMS y el SDK de Firebase a tu código, así que tu
build no incluye ninguna copia de ellos. Son los paquetes listados en `shared` en tu
`vite.config.ts`, y solo los imports que nombran exactamente uno de ellos reciben la copia de FireCMS.

Para Firebase, eso significa importar desde los paquetes `@firebase/…`, no desde los puntos de
entrada `firebase/…`:

```ts
// No: el build apunta a un archivo que nunca genera
import { getFunctions, httpsCallable } from "firebase/functions";

// Sí
import { getApp } from "@firebase/app";
import { getFunctions, httpsCallable } from "@firebase/functions";
```

Lo mismo vale para `@firebase/firestore`, `@firebase/auth`, `@firebase/storage`,
`@firebase/analytics`, `@firebase/remote-config` y `@firebase/app-check`. Se instalan junto con
`firebase`; si tu gestor de paquetes no los instala en el nivel superior (pnpm, por ejemplo), añade a
tu `package.json` los que importes.

`getApp()` devuelve la app de Firebase de tu proyecto, la que usa FireCMS. Puede que FireCMS aún no la
haya inicializado cuando se carga tu código, así que llama a `getApp()`, `getFunctions()`,
`getFirestore()` y similares cuando tu código se ejecute, dentro de un componente o un callback, no en
el nivel superior de un archivo.

## Solución de problemas

### "Error loading remote config"

FireCMS muestra este mensaje cuando no puede cargar o ejecutar tu código desplegado. Abre la consola
del navegador para ver por qué:

- **Un 404 en un archivo llamado `__federation_shared_…`**, a menudo seguido de un mensaje sobre un
  tipo MIME no permitido (`application/json`): tu código importa un paquete compartido por otra ruta,
  normalmente `firebase/…` en lugar de `@firebase/…`. Consulta
  [Importar Firebase en tu código](#importar-firebase-en-tu-código). Las versiones más recientes de `firecms deploy` lo
  detectan antes de subir el build e indican qué imports cambiar.
- **Una excepción de tu propio código**: algo falló mientras se cargaba tu configuración, por ejemplo
  una llamada a `getFirestore()` en el nivel superior de un archivo antes de que Firebase estuviera
  inicializado. La traza de la pila señala dónde.

Que no haya archivos `__federation_shared_…` en `dist/assets` es lo esperado, no una señal de un build
roto: FireCMS proporciona esos paquetes, así que el build no los incluye.

### Un 404 en `material-icons-….woff2`

Si la consola muestra un 404 para `/assets/material-icons-….woff2` en `api.firecms.co`, puede que los
iconos de tu código no se muestren. Tu `vite.config.ts` es anterior a la corrección de las URL de
fuentes de la plantilla: copia el bloque `experimental.renderBuiltUrl` del
[`vite.config.ts` de la plantilla de FireCMS Cloud](https://github.com/firecmsco/firecms/blob/main/packages/cli/templates/template_cloud/vite.config.ts) en el tuyo, y vuelve a hacer el build y a
desplegar.

## Despliegue

Los proyectos de FireCMS Cloud solo se pueden desplegar en FireCMS Cloud.

Si necesitas una versión de FireCMS autoalojada (self-hosted), puedes usar el plan PRO o la versión Community.
Dado que las APIs son las mismas para todas las versiones, puedes cambiar fácilmente entre ellas.
