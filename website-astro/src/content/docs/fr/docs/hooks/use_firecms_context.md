---
slug: fr/docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Récupère le contexte qui inclut les contrôleurs internes et les contextes utilisés par l'application.
Certains contrôleurs et contextes inclus dans ce contexte peuvent être accédés
directement depuis leurs hooks respectifs.

Les propriétés fournies par ce hook sont :

* `dataSource` : Connecteur vers votre base de données, par exemple votre base de données Firestore

* `storageSource` : Implémentation de stockage utilisée

* `navigation` : Contexte qui inclut la navigation résolue ainsi que les méthodes et
  attributs utilitaires.

* `sideEntityController` : Contrôleur pour ouvrir le dialogue latéral affichant les formulaires d'entité

* `sideDialogsController` : Contrôleur utilisé pour ouvrir les dialogues latéraux (utilisé en interne par
  les dialogues latéraux d'entité ou les dialogues de référence)

* `dialogsController` : Contrôleur utilisé pour ouvrir des dialogues réguliers

* `authController` : Contrôleur d'authentification utilisé

* `customizationController` : Contrôleur contenant les options de personnalisation du CMS

* `snackbarController` : Utilisez ce contrôleur pour afficher des snackbars

* `userConfigPersistence` : Utilisez ce contrôleur pour accéder aux données stockées dans le navigateur de l'utilisateur

* `analyticsController` : Callback pour envoyer des événements d'analytiques (optionnel)

* `userManagement` : Section utilisée pour gérer les utilisateurs dans le CMS. Utilisée pour afficher les informations
  de l'utilisateur à divers endroits et attribuer la propriété des entités.

Exemple :

```tsx
import React from "react";
import { useFireCMSContext } from "@firecms/core";

export function ExampleCMSView() {

    const context = useFireCMSContext();

    // Accéder à la source de données
    const dataSource = context.dataSource;

    // Ouvrir un snackbar
    context.snackbarController.open({
        type: "success",
        message: "Message d'exemple"
    });

    return <div>Vue d'exemple</div>;
}
```
