---
title: useClipboard
sidebar_label: useClipboard
description: Hook utilitaire pour copier du texte dans le presse-papiers.
---

Un hook utilitaire pour copier du texte dans le presse-papiers système. Il gère l'API `navigator.clipboard` et les mécanismes de secours.

### Utilisation

```tsx
import React from "react";
import { useClipboard } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CopyButton({ text }: { text: string }) {
    const { copy, isCoppied } = useClipboard({
        copiedDuration: 2000 // Réinitialiser l'état après 2 secondes
    });

    return (
        <Button onClick={() => copy(text)}>
            {isCoppied ? "Copié !" : "Copier dans le presse-papiers"}
        </Button>
    );
}
```

### Options

```tsx
export interface UseClipboardProps {
    /**
     * Fonction de callback appelée après l'exécution de la commande `copy`.
     */
    onSuccess?: (text: string) => void;

    /**
     * Se déclenche quand le hook rencontre une erreur.
     */
    onError?: (error: string) => void;

    /**
     * Désactive la nouvelle API presse-papiers `navigator.clipboard` même si elle est prise en charge.
     */
    disableClipboardAPI?: boolean;

    /**
     * Durée en ms pour garder l'indicateur `isCoppied` à true.
     */
    copiedDuration?: number;
}
```

### Valeurs de retour

```tsx
export interface useClipboardReturnType {
    /**
     * Utiliser ref pour extraire le contenu texte.
     */
    ref: MutableRefObject<any>;

    /**
     * Effectuer l'opération de copie
     */
    copy: (text?: string) => void;

    /**
     * Effectuer l'opération de coupure
     */
    cut: () => void;

    /**
     * Indique si le contenu a été copié avec succès.
     * Note : Faute de frappe héritée de la bibliothèque source.
     */
    isCoppied: boolean;

    /**
     * Contenu actuel du presse-papiers sélectionné.
     */
    clipboard: string;

    /**
     * Efface le presse-papiers de l'utilisateur.
     */
    clearClipboard: () => void;

    /**
     * Vérifie si le navigateur prend en charge l'API `navigator.clipboard`.
     */
    isSupported: () => boolean;
}
```
