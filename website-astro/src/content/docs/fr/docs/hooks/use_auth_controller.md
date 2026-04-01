---
slug: fr/docs/hooks/use_auth_controller
title: useAuthController
sidebar_label: useAuthController
---

:::note
Veuillez noter que pour utiliser ces hooks, vous **devez** être dans
un composant (vous ne pouvez pas les utiliser directement depuis une fonction callback).
Cependant, les callbacks incluent généralement un `FireCMSContext`, qui contient tous
les contrôleurs.
:::

## `useAuthController`

Hook pour accéder à l'état d'authentification et effectuer des opérations liées à l'authentification.
Fonctionne avec n'importe quel backend (Firebase, MongoDB ou implémentations personnalisées).

Les propriétés fournies par ce hook sont :

* `user` L'objet utilisateur actuellement connecté, ou `null` si non authentifié
* `initialLoading` Indicateur de chargement initial, utilisé pour éviter d'afficher l'écran de connexion avant que l'état d'authentification ne soit déterminé
* `authLoading` Indique si le processus de connexion/déconnexion est en cours
* `signOut()` Déconnecter l'utilisateur actuel
* `authError` Erreur lors de l'initialisation de l'authentification
* `authProviderError` Erreur émise par le fournisseur d'authentification
* `getAuthToken()` Récupérer le jeton d'authentification de l'utilisateur actuel (retourne une Promise)
* `loginSkipped` Indique si l'utilisateur a ignoré le processus de connexion
* `extra` Données supplémentaires stockées dans le contrôleur d'authentification (utile pour les rôles, permissions, etc.)
* `setExtra(extra)` Définir des données supplémentaires dans le contrôleur d'authentification
* `setUser(user)` Définir l'utilisateur actuel de manière programmatique (optionnel, dépend de l'implémentation)
* `setUserRoles(roles)` Définir les rôles de l'utilisateur (optionnel, dépend de l'implémentation)

Exemple :

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
