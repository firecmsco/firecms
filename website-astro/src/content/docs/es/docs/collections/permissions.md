---
title: Permisos (Permissions)
sidebar_label: Permisos
---

Puedes definir los permisos de lectura (`read`), edición (`edit`), creación (`create`) y eliminación (`delete`) a nivel de colección,
también dependiendo del usuario que haya iniciado sesión.

Estos definen las acciones que el usuario registrado puede realizar sobre una entidad.

### Permisos simples

En el caso más simple, puedes asignar directamente los permisos

```tsx
import { buildCollection } from "@firecms/core";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Productos",
    permissions: {
        edit: true,
        create: true,
        delete: false
    }
});
```

### Permisos avanzados

Puedes personalizar los permisos en base al usuario que ha iniciado sesión, o cualquier
otro criterio que se adapte a tu caso de uso.

Puedes usar un `PermissionBuilder`, como en el ejemplo a continuación, para personalizar las
acciones basadas en el usuario registrado.

En el ejemplo a continuación comprobamos si hemos guardado previamente el rol "admin"
en el campo extras del `AuthController`.

```tsx
import { buildCollection } from "@firecms/core";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Productos",
    permissions: ({
                      entity,
                      path,
                      user,
                      authController,
                      context
                  }) => {
        const isAdmin = authController.extra?.roles.includes("admin");
        return ({
            edit: isAdmin,
            create: isAdmin,
            delete: isAdmin
        });
    }
});
```

Ten en cuenta que puedes establecer el parámetro `extra` en el `AuthController` con cualquier dato
que tenga sentido para ti. Los lugares sugeridos donde es posible que desees configurar este
parámetro son `Authenticator` ya que se inicializa
antes que el resto de la aplicación.

Ejemplo rápido de cómo se inicializa el campo `extra.roles` en el ejemplo anterior:

```tsx
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
                                                                       user,
                                                                       authController,
                                                                       dataSource
                                                                   }) => {
    // Este es un ejemplo de cómo recuperar datos asíncronos relacionados con el usuario
    // y almacenarlos en el campo extra del controlador
    const sampleUserData = await Promise.resolve({
        roles: ["admin"]
    });
    authController.setExtra(sampleUserData);

    console.log("Permitiendo acceso a", user);
    return true; // Permitir
};
```

