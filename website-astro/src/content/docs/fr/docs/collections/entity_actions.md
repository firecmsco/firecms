---
title: Actions d'entité
slug: fr/docs/collections/entity_actions
sidebar_label: Actions d'entité
---

Les entités peuvent être modifiées, supprimées et dupliquées par défaut.

Les actions par défaut sont activées ou désactivées selon les permissions
de l'utilisateur dans la collection.

Si vous avez besoin d'ajouter des actions personnalisées, vous pouvez le faire en les définissant dans la
prop `entityActions` de la collection.

Vous pouvez également définir des actions d'entité globalement, et elles seront disponibles dans toutes les collections.
C'est utile pour les actions qui ne sont pas spécifiques à une seule collection, comme une action "Partager".
Lors de la définition d'une action d'entité globale, vous devez fournir une propriété `key` unique.

Les actions seront affichées dans le menu de la vue de collection par défaut
et dans la vue de formulaire si `includeInForm` est défini à true.

Vous pouvez accéder à tous les contrôleurs de FireCMS dans le `context`. C'est utile pour accéder à la source de données,
modifier des données, accéder au stockage, ouvrir des dialogues, etc.

Dans la prop `icon`, vous pouvez passer un élément React pour afficher une icône à côté du nom de l'action.
Nous recommandons d'utiliser l'une des [icônes FireCMS](/docs/icons), disponibles dans le package `@firecms/ui`.

### Définir des actions au niveau de la collection

```tsx
import { buildCollection } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Products",
    singularName: "Product",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive",
            onClick({
                        entity,
                        collection,
                        context,
                    }): Promise<void> {

                // vous pouvez accéder à tous les contrôleurs dans le contexte
                const dataSource = context.dataSource;

                // Ajoutez votre code ici
                return Promise.resolve(undefined);
            }
        }
    ],
    properties: {}
});
```

### Définir des actions globalement

Vous pouvez définir des actions d'entité globalement en les passant au composant `FireCMS` si vous auto-hébergez,
ou dans le `FireCMSAppConfig` si vous utilisez FireCMS Cloud.

```tsx
import { ShareIcon } from "@firecms/ui";

// Auto-hébergé
<FireCMS
    entityActions={[{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Votre logique de partage ici
        }
    }]}
    {...otherProps}
/>
```

```tsx
import { ShareIcon } from "@firecms/ui";

// FireCMS Cloud
const appConfig: FireCMSAppConfig = {
    entityActions: [{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Votre logique de partage ici
        }
    }],
    // ...autres configurations
};
```

#### EntityAction

* `name` : Nom de l'action
* `key`? : Clé de l'action. Vous n'avez besoin de la fournir que si vous voulez remplacer les actions par défaut, ou si vous définissez l'action globalement. Les actions par défaut sont :
  * `edit`
  * `delete`
  * `copy`
* `icon`? : React.ReactElement Icône de l'action
* `onClick` : (props: EntityActionClickProps) => Promise Fonction appelée quand l'action est cliquée
* `collapsed`? : boolean Afficher cette action repliée dans le menu de la vue de collection. Par défaut true. Si false, l'action sera affichée dans le menu
* `includeInForm`? : boolean Afficher cette action dans le formulaire, par défaut true
* `disabled`? : boolean Désactiver cette action, par défaut false

#### EntityActionClickProps

* `entity` : Entité en cours d'édition
* `context` : FireCMSContext, utilisé pour accéder à tous les contrôleurs
* `fullPath`? : string
* `fullIdPath`? : string
* `collection`? : EntityCollection
* `formContext`? : FormContext, présent si l'action est appelée depuis un formulaire.
* `selectionController`? : SelectionController, utilisé pour accéder aux entités sélectionnées ou modifier la sélection
* `highlightEntity`? : (entity: Entity) => void
* `unhighlightEntity`? : (entity: Entity) => void
* `onCollectionChange`? : () => void
* `sideEntityController`? : SideEntityController
* `view` : "collection" | "form"
* `openEntityMode` : "side_panel" | "full_screen"
* `navigateBack`? : () => void

## Exemples

Construisons un exemple où nous ajoutons une action pour archiver un produit.
Quand l'action est cliquée, nous appellerons une Google Cloud Function qui exécutera de la logique métier dans le backend.

### Utiliser l'API `fetch`

Vous pouvez utiliser l'API `fetch` standard pour appeler n'importe quel point de terminaison HTTP, y compris une Google Cloud Function. C'est une méthode polyvalente qui fonctionne avec n'importe quel backend.

```tsx
import { buildCollection, Product } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // autres propriétés
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive",
            collapsed: false,
            onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                return fetch("[YOUR_ENDPOINT]/archiveProduct", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productId: entity.id
                    })
                }).then(() => {
                    snackbarController.open({
                        message: "Product archived",
                        type: "success"
                    });
                }).catch((error) => {
                    snackbarController.open({
                        message: "Error archiving product",
                        type: "error"
                    });
                });
            }
        }
    ],
});
```

### Utiliser le SDK Firebase Functions

Si vous utilisez Firebase, l'approche recommandée est d'utiliser le SDK Firebase Functions. Il simplifie l'appel des fonctions et gère automatiquement les tokens d'authentification.

Tout d'abord, assurez-vous d'avoir le package `firebase` installé et initialisé dans votre projet.

Ensuite, vous pouvez définir votre action comme ceci :

```tsx
import { getFunctions, httpsCallable } from "firebase/functions";
import { ArchiveIcon } from "@firecms/ui";
import { buildCollection, Product } from "@firecms/core";

// Initialiser Firebase Functions
// Assurez-vous d'avoir initialisé Firebase ailleurs dans votre application
const functions = getFunctions();
const archiveProductCallable = httpsCallable(functions, 'archiveProduct');

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // autres propriétés
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive with Firebase",
            collapsed: false,
            async onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                try {
                    await archiveProductCallable({ productId: entity.id });
                    snackbarController.open({
                        message: "Product archived successfully",
                        type: "success"
                    });
                } catch (error) {
                    console.error("Error archiving product:", error);
                    snackbarController.open({
                        message: "Error archiving product: " + error.message,
                        type: "error"
                    });
                }
            }
        }
    ],
});
```
