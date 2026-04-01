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

## Despliegue

Los proyectos de FireCMS Cloud solo se pueden desplegar en FireCMS Cloud.

Si necesitas una versión de FireCMS autoalojada (self-hosted), puedes usar el plan PRO o la versión Community.
Dado que las APIs son las mismas para todas las versiones, puedes cambiar fácilmente entre ellas.
