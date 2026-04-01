---
slug: de/docs/hooks/use_auth_controller
title: useAuthController
sidebar_label: useAuthController
---

:::note
Bitte beachten Sie, dass Sie diese Hooks **nur** innerhalb
einer Komponente verwenden können (Sie können sie nicht direkt in einer Callback-Funktion verwenden).
Callbacks enthalten in der Regel jedoch einen `FireCMSContext`, der alle
Controller enthält.
:::

## `useAuthController`

Hook für den Zugriff auf den Authentifizierungsstatus und die Durchführung von authentifizierungsbezogenen Operationen.
Funktioniert mit jedem Backend (Firebase, MongoDB oder eigene Implementierungen).

Die von diesem Hook bereitgestellten Eigenschaften sind:

* `user` Das aktuell angemeldete Benutzerobjekt oder `null`, wenn nicht authentifiziert
* `initialLoading` Initiales Lade-Flag, um die Anzeige des Anmeldebildschirms zu vermeiden, bevor der Authentifizierungsstatus ermittelt wurde
* `authLoading` Gibt an, ob der Anmelde-/Abmeldevorgang läuft
* `signOut()` Den aktuellen Benutzer abmelden
* `authError` Fehler bei der Initialisierung der Authentifizierung
* `authProviderError` Fehler, der vom Authentifizierungsanbieter ausgelöst wurde
* `getAuthToken()` Authentifizierungstoken für den aktuellen Benutzer abrufen (gibt ein Promise zurück)
* `loginSkipped` Gibt an, ob der Benutzer den Anmeldevorgang übersprungen hat
* `extra` Zusätzliche Daten im Authentifizierungs-Controller (nützlich für Rollen, Berechtigungen usw.)
* `setExtra(extra)` Zusätzliche Daten im Authentifizierungs-Controller setzen
* `setUser(user)` Aktuellen Benutzer programmatisch setzen (optional, implementierungsabhängig)
* `setUserRoles(roles)` Benutzerrollen setzen (optional, implementierungsabhängig)

Beispiel:

```tsx
import React from "react";
import { useAuthController } from "@firecms/core";

export function ExampleCMSView() {

    const authController = useAuthController();

    if (authController.authLoading) {
        return <div>Loading...</div>;
    }

    return (
        authController.user ?
            <div>Logged in as {authController.user.displayName}</div>
            :
            <div>You are not logged in</div>
    );
}
```
