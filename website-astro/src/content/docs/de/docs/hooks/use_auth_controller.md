---
title: useAuthController
sidebar_label: useAuthController
---

:::note
Bitte beachten Sie, dass Sie zur Verwendung dieser Hooks **in einer Komponente** sein müssen.
Callbacks beinhalten jedoch normalerweise einen `FireCMSContext`, der alle Controller enthält.
:::

## `useAuthController`

Hook für den Zugriff auf den Authentifizierungsstatus und die Durchführung auth-bezogener Operationen.

Die von diesem Hook bereitgestellten Props sind:

* `user` Das aktuell eingeloggte Benutzerobjekt, oder `null` wenn nicht authentifiziert
* `initialLoading` Initiales Lademarkierung, verwendet um den Login-Bildschirm zu vermeiden, bevor der Auth-Status bestimmt ist
* `authLoading` Wird der Login/Logout-Prozess gerade durchgeführt
* `signOut()` Den aktuellen Benutzer abmelden
* `authError` Fehler während der Authentifizierungsinitialisierung
* `authProviderError` Fehler des Authentifizierungsanbieters
* `getAuthToken()` Auth-Token für den aktuellen Benutzer abrufen (gibt ein Promise zurück)
* `loginSkipped` Hat der Benutzer den Login-Prozess übersprungen
* `extra` Zusätzliche Daten im Auth-Controller (nützlich für Rollen, Berechtigungen, etc.)
* `setExtra(extra)` Zusätzliche Daten im Auth-Controller setzen

Beispiel:

```tsx
import React from "react";
import { useAuthController } from "@firecms/core";

export function ExampleCMSView() {

    const authController = useAuthController();

    if (authController.authLoading) {
        return <div>Laden...</div>;
    }

    return (
        authController.user ?
            <div>Eingeloggt als {authController.user.displayName}</div>
            :
            <div>Sie sind nicht eingeloggt</div>
    );
}
```
