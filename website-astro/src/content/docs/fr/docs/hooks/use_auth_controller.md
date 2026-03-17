---
title: useAuthController
sidebar_label: useAuthController
---

:::note
Ces hooks ne peuvent être utilisés que depuis les **composants React** montés à l'intérieur
de l'arborescence `FireCMS`. Vous ne pouvez pas les utiliser directement depuis une fonction de callback.
Les callbacks incluent généralement un `FireCMSContext`, qui contient tous les contrôleurs.
:::

## `useAuthController`

Hook pour accéder à l'état d'authentification et effectuer des opérations liées à l'auth.
Fonctionne avec n'importe quel backend (Firebase, MongoDB ou implémentations personnalisées).

Les props fournies par ce hook sont :

* `user` L'objet utilisateur actuellement connecté, ou `null` si non authentifié
* `initialLoading` Indicateur de chargement initial, utilisé pour éviter d'afficher l'écran de connexion avant que l'état d'auth soit déterminé
* `authLoading` Le processus de connexion/déconnexion est-il en cours
* `signOut()` Déconnecter l'utilisateur actuel
* `authError` Erreur lors de l'initialisation de l'authentification
* `authProviderError` Erreur distribuée par le fournisseur d'auth
* `getAuthToken()` Récupérer le token d'auth pour l'utilisateur actuel (retourne une Promise)
* `loginSkipped` L'utilisateur a-t-il ignoré le processus de connexion
* `extra` Données supplémentaires stockées dans le contrôleur d'auth (utile pour les rôles, permissions, etc.)
* `setExtra(extra)` Définir des données supplémentaires dans le contrôleur d'auth
* `setUser(user)` Définir programmatiquement l'utilisateur actuel (optionnel, dépend de l'implémentation)
* `setUserRoles(roles)` Définir les rôles utilisateur (optionnel, dépend de l'implémentation)

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
            <div>Connecté en tant que {authController.user.displayName}</div>
            :
            <div>Vous n'êtes pas connecté</div>
    );
}
```
