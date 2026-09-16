---
slug: es/docs/self/telemetry
title: Telemetría y comprobación de licencia
sidebar_label: Telemetría
description: La única petición que una app de FireCMS autoalojada envía a FireCMS, qué contiene, qué guardamos y por qué, y cómo desactivarla en Community.
---

Una app de FireCMS autoalojada lee y escribe tus datos desde el navegador, a través del SDK de Firebase o de tu propio backend. A FireCMS le envía una sola petición: el registro de acceso, que también es la comprobación de la licencia PRO. Esta página detalla exactamente qué contiene esa petición y qué guardamos.

## Cuándo se envía

Una vez por usuario con sesión iniciada cada vez que se carga la app: cuando un usuario inicia sesión, o cuando la app se abre con un usuario que ya tenía la sesión iniciada, el navegador envía una petición `POST` a `https://api.firecms.co/access_log`. También se envía en desarrollo local.

## Qué contiene la petición

- **Cabecera `Authorization`**: el token de ID del usuario con sesión iniciada, de tu proveedor de autenticación (por ejemplo Firebase Authentication).
- **Cabecera `Referer`**: la añade el navegador; es la URL de la página en la que se ejecuta la app.
- **Cuerpo**:
  - `apiKey`: tu clave de licencia PRO, si la configuraste
  - `email`: el email del usuario con sesión iniciada
  - `datasource`: la clave de la fuente de datos en uso, por ejemplo `firestore`
  - `plugins`: las claves de los plugins que configuraste, por ejemplo `["collection_editor", "user_management"]`

La petición no contiene credenciales de base de datos, ni documentos u otro contenido de Firestore, ni esquemas de colecciones.

## Qué guardamos

Nuestro servidor lee el ID del proyecto de Firebase del token de ID y guarda una entrada por petición con:

- el ID del proyecto de Firebase y, si se envió una clave de licencia, el ID de la licencia
- el uid y el email del usuario
- los claims decodificados del token de ID. Incluyen el uid y el email, y el nombre visible, la URL de la foto y el proveedor de inicio de sesión cuando tu proveedor de autenticación los define.
- la URL del referer
- la clave de la fuente de datos y las claves de los plugins
- el resultado de la comprobación de licencia (si se pausaron las funciones PRO)
- una marca de tiempo

Las entradas se guardan en nuestro proyecto de Google Cloud, en Firestore y con una copia en BigQuery para analizar el uso. El cuerpo de la petición, sin la clave de licencia, también se escribe en los logs de nuestro servidor.

## Para qué

- **Validar la licencia.** En un proyecto que usa plugins PRO, la respuesta indica a la app si funcionan o se pausan.
- **El reloj de la prueba.** La [prueba de 30 días en producción](/es/docs/pro/licensing) de un proyecto empieza con su primera entrada desde una app desplegada que usa plugins PRO.
- **Contar el uso.** Cuántos proyectos y usuarios usan FireCMS Community y PRO, y qué plugins utilizan.

## Emails

Cuando una app desplegada usa plugins PRO, también usamos el email de la entrada para escribir a ese usuario sobre PRO: un email de bienvenida la primera vez que el proyecto ejecuta PRO, un seguimiento unos 14 días después y un aviso si la comprobación de licencia pausa las funciones PRO. Ninguno se envía dos veces a la misma dirección para el mismo proyecto.

## Conservación

Actualmente las entradas se conservan sin una fecha de borrado fija. Escribe a [hello@firecms.co](mailto:hello@firecms.co) para que borremos las entradas de tu proyecto.

## Desactivarla

En una app sin `apiKey` y sin plugins PRO, pasa `telemetry={false}` a `FireCMS` y la petición no se envía:

```tsx
<FireCMS
    telemetry={false}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}>
    {/* ... */}
</FireCMS>
```

Con un `apiKey` configurado, o con algún plugin PRO (editor de colecciones, gestión de usuarios, importación/exportación, historial de entidades, data enhancement, DataTalk), la petición se envía siempre: es la comprobación de licencia e inicia la prueba.

## Otras peticiones a FireCMS

Esta página solo cubre el registro de acceso. Las funciones de IA opcionales (data enhancement, DataTalk y la generación de colecciones con IA del editor de colecciones) envían a `api.firecms.co` los campos y prompts con los que las usas. Solo se ejecutan si las añades a tu app.
