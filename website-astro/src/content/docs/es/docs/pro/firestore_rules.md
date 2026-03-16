---
slug: es/docs/pro/firestore_rules
title: Reglas de Firestore
sidebar_label: Reglas de Firestore
description: Configura las reglas de seguridad de Firestore para FireCMS PRO para proteger los datos de gestión de usuarios y configuración de colecciones.
---

:::note
Estas reglas se aplican específicamente a la configuración de los plugins de FireCMS PRO. Si estás usando la versión community,
te recomendamos escribir tus propias reglas para proteger tus datos.
:::

FireCMS PRO guarda algunos datos de configuración en Firestore para gestionar roles y permisos de usuario, así como la
configuración de colecciones. Para que funcione correctamente, necesitas configurar las reglas de Firestore para permitir
que el plugin lea y escriba en las rutas especificadas.

Estas son las rutas por defecto usadas por FireCMS (puedes modificar esas rutas en la configuración específica del plugin):

- `__FIRECMS/config/users`
- `__FIRECMS/config/roles`
- `__FIRECMS/config/collections`

### Reglas de configuración inicial

Dependiendo de la configuración de tu proyecto, el usuario conectado podría no tener permiso para escribir en la base de datos Firestore,
en la ruta de configuración de FireCMS. En este caso sugerimos permitir temporalmente el acceso a la ruta `__FIRECMS` y
subcolecciones.

```
match /__FIRECMS/{document=**} {
  allow read: if true;
  allow write: if true;
}
```

### Reglas finales sugeridas

Después de haber creado el primer usuario y roles, puedes restringir el acceso a la ruta `__FIRECMS` nuevamente.
Te recomendamos configurar reglas específicas para tu proyecto, basadas en tus requisitos de seguridad.

Estas son las reglas que sugerimos:

```
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/users/$(request.auth.token.email));
}
```

Estas reglas permitirán a los usuarios que tienen un rol CMS leer y escribir todos los datos en tu base de datos Firestore.
Los roles se aplicarán en el frontend por FireCMS, pero si es un requisito para tu proyecto, también puedes
aplicarlos en las reglas de Firestore, configurando tus propias reglas personalizadas.

