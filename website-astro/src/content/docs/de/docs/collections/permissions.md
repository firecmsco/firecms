---
slug: de/docs/collections/permissions
title: Berechtigungen
sidebar_label: Berechtigungen
---

Sie können die Berechtigungen `read`, `edit`, `create` und `delete` auf der Kollektions-
ebene definieren, auch abhängig vom eingeloggten Benutzer.

Diese definieren die Aktionen, die der eingeloggte Benutzer über eine Entity ausführen kann.

### Einfache Berechtigungen

Im einfachsten Fall können Sie die Berechtigungen direkt zuweisen

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

### Erweiterte Berechtigungen

Sie können die Berechtigungen basierend auf dem eingeloggten Benutzer oder anderen
Kriterien anpassen, die zu Ihrem Anwendungsfall passen.

Sie können einen `PermissionBuilder` verwenden, wie im folgenden Beispiel, um die
Aktionen basierend auf dem eingeloggten Benutzer anzupassen.

Im folgenden Beispiel prüfen wir, ob wir zuvor die Rolle „admin"
im extras-Feld des `AuthController` gespeichert haben.

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

Beachten Sie, dass Sie den `extra`-Parameter im `AuthController` auf beliebige Daten setzen können,
die für Sie sinnvoll sind. Empfohlene Stellen, wo Sie diesen Parameter setzen möchten,
sind `Authenticator`, da er vor dem Rest der App initialisiert wird.

Kurzes Beispiel, wie das `extra.roles`-Feld im vorherigen Beispiel initialisiert wird:

```tsx
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
                                                                       user,
                                                                       authController,
                                                                       dataSource
                                                                   }) => {
    // Dies ist ein Beispiel für das Abrufen asynchroner Daten zum Benutzer
    // und das Speichern in dem extra-Feld des Controllers
    const sampleUserData = await Promise.resolve({
        roles: ["admin"]
    });
    authController.setExtra(sampleUserData);

    console.log("Allowing access to", user);
    return true; // Zugriff erlauben
};
```
