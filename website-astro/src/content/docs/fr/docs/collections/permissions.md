---
title: Permissions
slug: fr/docs/collections/permissions
sidebar_label: Permissions
---

Vous pouvez définir les permissions `read`, `edit`, `create` et `delete` au niveau de la collection,
en fonction aussi de l'utilisateur connecté.

Elles définissent les actions que l'utilisateur connecté peut effectuer sur une entité.

### Permissions simples

Dans le cas le plus simple, vous pouvez attribuer directement les permissions

```tsx
import { buildCollection } from "@firecms/core";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Products",
    permissions: {
        edit: true,
        create: true,
        delete: false
    }
});
```

### Permissions avancées

Vous pouvez personnaliser les permissions en fonction de l'utilisateur connecté, ou de tout
autre critère adapté à votre cas d'utilisation.

Vous pouvez utiliser un `PermissionBuilder`, comme dans l'exemple ci-dessous, pour personnaliser les
actions en fonction de l'utilisateur connecté.

Dans l'exemple ci-dessous, nous vérifions si nous avons précédemment sauvegardé le rôle "admin"
dans le champ extras du `AuthController`.

```tsx
import { buildCollection } from "@firecms/core";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Products",
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

Notez que vous pouvez définir le paramètre `extra` dans le `AuthController` pour toute donnée
qui vous convient. Les endroits suggérés où vous pourriez vouloir définir ce paramètre
sont `Authenticator` car il est initialisé avant le reste de l'application.

Exemple rapide de la façon dont le champ `extra.roles` dans l'exemple précédent est
initialisé :

```tsx
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
                                                                       user,
                                                                       authController,
                                                                       dataSource
                                                                   }) => {
    // Ceci est un exemple de récupération de données asynchrones liées à l'utilisateur
    // et de stockage dans le champ extra du contrôleur
    const sampleUserData = await Promise.resolve({
        roles: ["admin"]
    });
    authController.setExtra(sampleUserData);

    console.log("Allowing access to", user);
    return true; // Autoriser
};
```
