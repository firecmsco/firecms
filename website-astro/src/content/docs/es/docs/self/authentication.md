---
slug: es/docs/self/auth_self_hosted
title: Autenticación y gestión de usuarios
sidebar_label: Autenticación y gestión de usuarios
description: Instrucciones sobre cómo configurar la autenticación y gestión de usuarios para una instancia self-hosted de FireCMS.
---

## Recomendado: FireCMS Pro y Cloud

Antes de implementar autenticación personalizada, recomendamos encarecidamente considerar **FireCMS Pro** o **FireCMS Cloud**, que incluyen:

- ✅ Sistema de gestión de usuarios integrado
- ✅ Permisos basados en roles (Admin, Editor, Viewer)
- ✅ Interfaz de gestión de equipos
- ✅ Sistema de invitación de usuarios
- ✅ Permisos granulares a nivel de colección y campo
- ✅ Registros de auditoría y seguimiento de actividad de usuarios
- ✅ Funcionalidades de seguridad de nivel enterprise

Estas soluciones proporcionan un sistema completo de autenticación y autorización listo para usar, ahorrándote tiempo significativo de desarrollo y asegurando las mejores prácticas de seguridad.

[Más información sobre gestión de usuarios en FireCMS Pro →](/docs/pro/user_management)

[Probar FireCMS Cloud →](https://app.firecms.co)


:::note

Cuando inicializas un nuevo proyecto FireCMS usando el CLI, podrías encontrar un autenticador básico en tu archivo `App.tsx`. Es una interfaz estándar de FireCMS y se ve algo así (¡no hace falta odiar a Flanders!):

```typescript
const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                   user,
                                                                                   authController
                                                                               }) => {
    if (user?.email?.includes("flanders")) {
        // Puedes lanzar un error para prevenir el acceso
        throw Error("¡Estúpido Flanders!");
    }
    console.log("Allowing access to", user);
    return true;
}, []);
```

Esto es solo un marcador de posición para mostrarte dónde implementar tu propia lógica de autenticación. Puedes reemplazarlo con uno de los autenticadores descritos abajo.

:::


## Parte 1: Gestión básica de usuarios

Esta sección cubre cómo crear una colección `users` para gestionar usuarios. Esta es la base para implementar permisos.

### Crear una colección "Users"

Esta colección almacenará tus usuarios.

```typescript
import { buildCollection, buildProperty } from "@firecms/core";

export type User = {
  name: string;
  email: string;
};

export const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  properties: {
    name: buildProperty({
      name: "Name",
      validation: { required: true },
      dataType: "string"
    }),
    email: buildProperty({
      name: "Email",
      validation: { required: true, email: true },
      dataType: "string"
    })
  }
});
```

:::tip
No olvides configurar las reglas de seguridad de Firestore para la ruta `users` para controlar quién puede leer y escribir en la colección.
:::

## Parte 2: Permisos basados en roles

Ahora, añadamos un `role` a nuestros usuarios y usémoslo para controlar el acceso.

### Paso 1: Actualizar la colección "Users" con roles

Añade una propiedad `role` a tu tipo `User` y colección.

```typescript
import { buildCollection, buildProperty } from "@firecms/core";

export enum UserRole {
  admin = "admin",
  editor = "editor",
  viewer = "viewer",
}

export type User = {
  name: string;
  email: string;
  role: UserRole;
}

export const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  properties: {
    name: buildProperty({
      name: "Name",
      validation: { required: true },
      dataType: "string"
    }),
    email: buildProperty({
      name: "Email",
      validation: { required: true, email: true },
      dataType: "string"
    }),
    role: buildProperty({
      name: "Role",
      validation: { required: true },
      dataType: "string",
      enumValues: {
        admin: "Admin",
        editor: "Editor",
        viewer: "Viewer"
      }
    })
  }
});
```

### Paso 2: Implementar un autenticador basado en roles

Primero, crea un nuevo archivo llamado `src/custom_authenticator.ts`. Este archivo contendrá tu lógica de autenticación.

**`src/custom_authenticator.ts`**
```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";
import { User } from "./collections/users"; // Asegúrate de importar tu tipo User

export const roleBasedAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController,
  dataSourceDelegate
}) => {
  if (!user?.email) return false;

  try {
    const userEntities = await dataSourceDelegate.fetchCollection<User>({
      path: "users",
      filter: { email: ["==", user.email] }
    });

    if (userEntities && userEntities.length > 0) {
      const member = userEntities[0].values;
      authController.setExtra({
        role: member.role
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error de autenticación:", error);
    return false;
  }
};
```

Ahora, importa el `roleBasedAuthenticator` en tu `App.tsx` y pásalo al componente `FirebaseCMSApp`.

**`src/App.tsx`**
```typescript
import { FirebaseCMSApp } from "@firecms/firebase";
import { roleBasedAuthenticator } from "./custom_authenticator";
import { usersCollection } from "./collections/users"; // Asegúrate de importar tus colecciones

// ... otras importaciones

function App() {
    // ... otra lógica del componente

    return (
        <FirebaseCMSApp
            name={"My App"}
            authentication={roleBasedAuthenticator}
            collections={[usersCollection, /* ...otras colecciones */]}
            // ... otras props
        />
    );
}

export default App;
```

### Paso 3: Aplicar permisos a las colecciones

Usa el callback `permissions` en tus colecciones para controlar el acceso basado en el rol del usuario.

```typescript
import { buildCollection } from "@firecms/core";
import { UserRole } from "./collections/users";

export const postsCollection = buildCollection({
  name: "Posts",
  path: "posts",
  permissions: ({ authController }) => {
    const userRole = authController.extra?.role;
    return {
      read: true, // Todos los roles pueden leer
      edit: userRole === UserRole.admin || userRole === UserRole.editor,
      create: userRole === UserRole.admin || userRole === UserRole.editor,
      delete: userRole === UserRole.admin
    };
  },
  // ... propiedades
});
```

## Parte 3: Usar Firebase Custom Claims para permisos

Una alternativa a almacenar roles en Firestore es usar los custom claims de Firebase Authentication.

### Paso 1: Establecer Custom Claims

Necesitas establecer custom claims para un usuario desde un entorno backend usando el Firebase Admin SDK. Esto típicamente se hace en una Cloud Function.

```typescript
// Ejemplo de Cloud Function para establecer un claim de rol
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Debes ser admin para establecer roles.");
  }

  const { uid, role } = data;
  await admin.auth().setCustomUserClaims(uid, { role });

  return { message: `¡Éxito! Al usuario ${uid} se le ha dado el rol de ${role}.` };
});
```

### Paso 2: Implementar un autenticador basado en Claims

Este autenticador lee los custom claims del token de ID del usuario.

```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

export const claimsAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController
}) => {
  if (!user) return false;

  try {
    const idTokenResult = await user.firebaseUser.getIdTokenResult(true); // Forzar refresco
    const role = idTokenResult.claims.role || "viewer"; // Por defecto 'viewer' si no hay claim de rol
    authController.setExtra({ role });
    return true;
  } catch (error) {
    console.error("Error de autenticación:", error);
    return false;
  }
};
```

### Paso 3: Usar Claims en las colecciones

La implementación de `permissions` es la misma que con el enfoque basado en roles, ya que el rol se extrae y se coloca en `authController.extra`.

```typescript
import { buildCollection } from "@firecms/core";

export const articlesCollection = buildCollection({
  name: "Articles",
  path: "articles",
  permissions: ({ authController }) => {
    const userRole = authController.extra?.role;
    return {
      read: true,
      edit: userRole === "admin" || userRole === "editor",
      create: userRole === "admin" || userRole === "editor",
      delete: userRole === "admin"
    };
  },
  // ... propiedades
});
```

## Mejores prácticas de seguridad

- **Reglas de seguridad de Firestore**: Siempre aplica reglas de seguridad en tu backend. Los permisos del lado del cliente son para propósitos de UI/UX y pueden ser eludidos.
- **Validación del lado del servidor**: Para operaciones críticas, valida los permisos en un servidor.
- **Principio de menor privilegio**: Otorga a los usuarios el nivel mínimo de acceso que necesitan.
