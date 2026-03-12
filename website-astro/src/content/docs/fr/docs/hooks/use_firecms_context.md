---
slug: fr/docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Obtenez le contexte qui inclut les contrôleurs et contextes internes utilisés par l'application.
Certains contrôleurs et contextes inclus dans ce contexte peuvent être accédés
directement depuis leurs hooks respectifs.

Les props fournies par ce hook sont :

* `dataSource` : Connecteur à votre base de données, ex. votre base de données Firestore

* `storageSource` : Implémentation de stockage utilisée

* `navigation` : Contexte qui inclut la navigation résolue et les méthodes utilitaires et attributs.

* `sideEntityController` : Contrôleur pour ouvrir le dialogue latéral affichant les formulaires d'entités

* `sideDialogsController` : Contrôleur utilisé pour ouvrir des dialogues latéraux (utilisé en interne par les dialogues d'entités latéraux ou les dialogues de référence)

* `dialogsController` : Contrôleur utilisé pour ouvrir des dialogues réguliers

* `authController` : Contrôleur d'auth utilisé

* `customizationController` : Contrôleur contenant les options de personnalisation pour le CMS

* `snackbarController` : Utilisez ce contrôleur pour afficher des snackbars

* `userConfigPersistence` : Utilisez ce contrôleur pour accéder aux données stockées dans le navigateur pour l'utilisateur

* `analyticsController` : Callback pour envoyer des événements analytics (optionnel)

* `userManagement` : Section utilisée pour gérer les utilisateurs dans le CMS. Utilisé pour afficher les infos utilisateur à divers endroits et assigner la propriété d'entité.

Exemple :

```tsx
import React from "react";
import { useFireCMSContext } from "@firecms/core";

export function ExampleCMSView() {

    const context = useFireCMSContext();

    // Accéder à la source de données
    const dataSource = context.dataSource;

    // Ouvrir une snackbar
    context.snackbarController.open({
        type: "success",
        message: "Exemple de message"
    });

    return <div>Exemple de vue</div>;
}
```
