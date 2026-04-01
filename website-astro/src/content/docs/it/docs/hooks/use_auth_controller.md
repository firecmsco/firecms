---
slug: it/docs/hooks/use_auth_controller
title: useAuthController
sidebar_label: useAuthController
---

:::note
Tieni presente che per utilizzare questi hook **devi** essere all'interno
di un componente (non puoi usarli direttamente da una funzione callback).
Tuttavia, i callback di solito includono un `FireCMSContext`, che contiene tutti
i controller.
:::

## `useAuthController`

Hook per accedere allo stato di autenticazione e eseguire operazioni relative all'autenticazione.
Funziona con qualsiasi backend (Firebase, MongoDB o implementazioni personalizzate).

Le proprietà fornite da questo hook sono:

* `user` L'oggetto utente attualmente autenticato, o `null` se non autenticato
* `initialLoading` Flag di caricamento iniziale, utilizzato per evitare di mostrare la schermata di login prima che lo stato di autenticazione sia determinato
* `authLoading` Indica se il processo di login/logout è in corso
* `signOut()` Disconnettere l'utente corrente
* `authError` Errore durante l'inizializzazione dell'autenticazione
* `authProviderError` Errore emesso dal provider di autenticazione
* `getAuthToken()` Ottenere il token di autenticazione dell'utente corrente (restituisce una Promise)
* `loginSkipped` Indica se l'utente ha saltato il processo di login
* `extra` Dati aggiuntivi memorizzati nel controller di autenticazione (utile per ruoli, permessi, ecc.)
* `setExtra(extra)` Impostare dati aggiuntivi nel controller di autenticazione
* `setUser(user)` Impostare l'utente corrente in modo programmatico (opzionale, dipende dall'implementazione)
* `setUserRoles(roles)` Impostare i ruoli dell'utente (opzionale, dipende dall'implementazione)

Esempio:

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
