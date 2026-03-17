---
title: Configuración de Firebase
sidebar_label: Configuración de Firebase
description: Guía paso a paso para configurar Firebase para FireCMS, incluyendo Firestore, Authentication, Storage y reglas de seguridad.
---

FireCMS se conecta directamente a tu proyecto de **Firebase** para proporcionar un potente **panel de administración** para tu **base de datos Firestore**. Antes de que puedas usar FireCMS como un **CMS headless** o **back-office** para tu aplicación, necesitas configurar tu proyecto de Firebase.

Esta guía cubre los pasos esenciales de configuración:
1. **Firestore** - Tu base de datos principal
2. **Authentication** - Controla quién puede acceder al panel de administración
3. **Storage** - Para subir archivos y gestión de medios
4. **Reglas de Seguridad** - Protege tus datos

### Firestore

Necesitas habilitar **Firestore** en él. Puedes inicializar las reglas de seguridad
en modo de prueba para permitir lecturas y escrituras, pero te recomendamos escribir reglas
que se adapten a tu dominio.

Ten en cuenta que las reglas deben definirse para cada colección y deben
definirse de una manera adecuada para tu dominio.

Consulta la [documentación de Firestore](https://firebase.google.com/docs/firestore/security/get-started)
para obtener más información.

:::important
En un proyecto de Firestore predeterminado, es probable que tus reglas de Firestore
no te permitan leer o escribir en la base de datos. Continúa leyendo para
aprender cómo configurar tus reglas.
:::

Por ejemplo, una regla simple que permite a cualquier usuario autenticado leer y escribir
en cualquier colección sería:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

pero lo ideal es que quieras hacerla más restrictiva. Para que la demostración de productos funcione, tus reglas deberían verse así:

```
rules_version = '2';
service cloud.firestore {

    // todo es privado por defecto
    match /{document=**} {
      allow read: if false;
      allow write: if false;
    }
    
    // permitir a todos leer la colección de products pero escribir solo a usuarios autenticados
    match /databases/{database}/documents {
        match /products/{id=**} {
          allow read: if true;
          allow write: if request.auth != null;
        }
    }
    
    // permitir a los usuarios modificar solo su propio documento de usuario
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
}

```

### Web app

En la configuración del proyecto, necesitas crear una **Web app** dentro de tu
proyecto, de la cual puedes obtener tu configuración de Firebase como un objeto Javascript.
Ese es el objeto que necesitas pasar al CMS.

![firebase_setup](/img/firebase_setup_app.png)

:::tip[Firebase Hosting]
Ten en cuenta que también puedes vincular tu nueva webapp a **Firebase Hosting**, lo que
te permitirá desplegarla con muy poco esfuerzo. Puedes crear el
sitio de Firebase Hosting en una etapa posterior y vincularlo a tu webapp.
:::

### Authentication

Lo más probable es que quieras habilitar la autenticación para pasar la pantalla inicial de inicio de sesión

:::important
Vite usa la url predeterminada `http://127.0.0.1:5173` para el servidor de desarrollo.
Firebase Auth requerirá agregar esta url a los dominios autorizados en la
consola de Firebase.
Alternativamente, puedes usar la url `http://localhost:5173`.
:::

![firebase_setup](/img/firebase_setup_auth.png)

### Storage

En caso de que quieras usar los diferentes campos de almacenamiento proporcionados por el CMS,
necesitas habilitar **Firebase Storage**. El bucket predeterminado se usará para
guardar tus archivos almacenados.

:::note
Si experimentas algún problema con CORS, puedes habilitar CORS en la configuración de tu
bucket como se especifica en: https://firebase.google.com/docs/storage/web/download-files#cors_configuration
Crea un archivo con el contenido:

```
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

y súbelo con: `gsutil cors set cors.json gs://<tu-bucket-de-cloud-storage>`.
:::
