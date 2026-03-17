---
title: Collections
sidebar_label: Collections
description: Définissez votre schéma de données Firestore avec les collections FireCMS. Créez des panneaux d'administration typés pour Firebase avec React et TypeScript.
---

Les **Collections** sont les blocs de construction centraux de votre **panneau d'administration** FireCMS. Elles définissent comment vos **données Firestore** sont affichées, éditées et gérées dans l'interface du CMS.

Si vous créez un **CMS headless** ou un **back-office** pour votre projet **Firebase**, les collections sont l'endroit où vous définissez :
- **Quelles données** les utilisateurs peuvent gérer (produits, utilisateurs, articles, commandes, etc.)
- **Comment ces données apparaissent** dans les formulaires et tableaux (types de champs, validation, mise en page)
- **Qui peut faire quoi** (permissions de création, lecture, mise à jour, suppression)
- **La logique personnalisée** (callbacks à la sauvegarde, champs calculés, effets de bord)

:::tip[Pourquoi utiliser les collections FireCMS ?]
Contrairement aux CMS traditionnels qui imposent un modèle de données rigide, les collections FireCMS se mappent directement à votre structure **Firestore** existante. Cela signifie que vous pouvez ajouter une puissante **interface d'administration basée sur React** à n'importe quel projet Firebase sans migrer vos données ni modifier votre schéma.
:::

Les collections apparaissent au **niveau supérieur** de la navigation (page d'accueil et tiroir), ou comme **sous-collections** imbriquées sous les entités parentes.

Vous pouvez définir des collections de deux façons :
- **Sans code** : Utilisez l'**interface de l'éditeur de collection** intégrée (nécessite les permissions appropriées)
- **Code d'abord** : Définissez les collections de façon programmatique avec le support complet de **TypeScript** et l'accès à toutes les fonctionnalités avancées (callbacks, champs personnalisés, propriétés calculées)

## Définir vos collections

Vous pouvez créer vos collections **dans l'interface ou en utilisant du code**. Vous pouvez également mélanger les deux approches, mais gardez à l'esprit que
les collections définies dans l'interface auront la priorité. Par exemple, vous pourriez avoir une propriété enum avec 2 valeurs définies
en code, et une valeur supplémentaire définie dans l'interface. Lors de la fusion, l'enum résultant aura 3 valeurs.

:::important
Vous pouvez avoir la même collection définie des deux façons. Dans ce cas, la collection définie dans l'interface
aura la priorité.

Une fusion profonde (deep merge) est effectuée, vous pouvez donc définir certaines propriétés en code, et les remplacer dans l'interface. Par exemple, vous
pouvez définir une propriété de chaîne enum et les valeurs seront fusionnées à partir des deux définitions.
:::

### Exemple de collection définie en code

:::note
FireCMS fournit environ 20 champs différents (comme les champs de texte, les sélecteurs, et des complexes comme les champs de référence ou
les champs de tableau triables). Si votre cas d'utilisation n'est pas couvert par l'un des champs fournis, vous pouvez créer votre
propre [champ personnalisé](../properties/custom_fields.mdx).
:::

:::tip
Vous n'avez pas besoin d'utiliser `buildCollection` ou `buildProperty` pour construire la configuration. Ce sont des fonctions d'identité
qui vous aideront à détecter les erreurs de type et de configuration.
:::

```tsx
import { buildCollection, buildProperty, EntityReference } from "@firecms/core";

type Product = {
  name: string;
  main_image: string;
  available: boolean;
  price: number;
  related_products: EntityReference[];
  publisher: {
    name: string;
    external_id: string;
  }
}

const productsCollection = buildCollection<Product>({
  id: "products",
  path: "products",
  name: "Products",
  group: "Main",
  description: "List of the products currently sold in our shop",
  textSearchEnabled: true,
  openEntityMode: "side_panel",
  properties: {
    name: buildProperty({
      dataType: "string",
      name: "Name",
      validation: { required: true }
    }),
    main_image: buildProperty({
      dataType: "string",
      name: "Image",
      storage: {
        mediaType: "image",
        storagePath: "images",
        acceptedFiles: ["image/*"],
        metadata: {
          cacheControl: "max-age=1000000"
        }
      },
      description: "Upload field for images",
      validation: {
        required: true
      }
    }),
    available: buildProperty({
      dataType: "boolean",
      name: "Available",
      columnWidth: 100
    }),
    price: buildProperty(({ values }) => ({
      dataType: "number",
      name: "Price",
      validation: {
        requiredMessage: "You must set a price between 0 and 1000",
        min: 0,
        max: 1000
      },
      disabled: !values.available && {
        clearOnDisabled: true,
        disabledMessage: "You can only set the price on available items"
      },
      description: "Price with range validation"
    })),
    related_products: buildProperty({
      dataType: "array",
      name: "Related products",
      description: "Reference to self",
      of: {
        dataType: "reference",
        path: "products"
      }
    }),
    publisher: buildProperty({
      name: "Publisher",
      description: "This is an example of a map property",
      dataType: "map",
      properties: {
        name: {
          name: "Name",
          dataType: "string"
        },
        external_id: {
          name: "External id",
          dataType: "string"
        }
      }
    })
  },
  permissions: ({
                  user,
                  authController
                }) => ({
    edit: true,
    create: true,
    delete: false
  })
});
```

Dans FireCMS Cloud, cette collection peut ensuite être utilisée en l'incluant dans la prop `collections` de votre export principal,
un objet `FireCMSAppConfig`.

Dans FireCMS PRO, les `collections` sont passées directement au hook `useBuildNavigationController`.

### Modifier une collection définie dans l'interface

Si vous avez juste besoin d'ajouter du code à une collection définie dans l'interface, vous pouvez utiliser la fonction `modifyCollection` dans
votre objet `FireCMSAppConfig`.

Cela s'applique uniquement à **FireCMS Cloud**.

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... collections définies entièrement en code ici
        ]);
    },
    modifyCollection: ({ collection }) => {
        if (collection.id === "products") {
            return {
                ...collection,
                name: "Products modified",
                entityActions: [
                    {
                        name: "Sample entity action",
                        onClick: ({ entity }) => {
                            console.log("Entity", entity);
                        }
                    }
                ]
            }
        }
        return collection;
    }
}

export default appConfig;
```

Vous pouvez utiliser toutes les props disponibles dans l'interface `Collection`.

## Sous-collections

Les sous-collections sont des collections d'entités qui se trouvent sous une autre entité. Par exemple, vous pouvez avoir une collection
nommée "traductions" sous l'entité "Article". Vous devez simplement utiliser le même format que pour définir votre collection
en utilisant le champ `subcollections`.

Les sous-collections sont facilement accessibles depuis la vue latérale lors de l'édition d'une entité.

## Filtres

:::tip
Si vous avez besoin d'avoir des filtres et un tri appliqués par défaut, vous pouvez utiliser les props `initialFilter` et `initialSort`.
Vous pouvez également forcer une combinaison de filtres à toujours être appliquée en utilisant la prop `forceFilter`.
:::

Le filtrage est activé par défaut pour les chaînes, nombres, booléens, dates et tableaux. Un menu déroulant est inclus dans chaque
colonne de la collection où applicable.

Puisque Firestore a des capacités de requête limitées, chaque fois que vous appliquez un filtre ou un nouveau tri, la combinaison précédente de tri/filtre
se réinitialise par défaut (sauf si on filtre ou trie par la même propriété).

Si vous avez besoin d'activer le filtrage/tri par plus d'une propriété à la fois, vous pouvez spécifier les filtres que vous avez
activés dans votre configuration Firestore. Pour ce faire, passez simplement la configuration des indexes à votre collection :

```tsx
import { buildCollection } from "@firecms/core";

const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Product",
    properties: {
        // ...
    },
    indexes: [
        {
            price: "asc",
            available: "desc"
        }
    ]
});
```

## Configuration de collection

Le `name` et les `properties` que vous définissez pour votre collection d'entités seront utilisés pour générer les champs dans les
tableaux de collection de type tableur, et les champs dans les formulaires générés.

:::tip
Vous pouvez forcer le CMS à toujours ouvrir le formulaire lors de l'édition d'un document en définissant la propriété `inlineEditing`
à `false` dans la configuration de la collection.
:::

- **`name`** : Le nom pluriel de la collection. Ex. : 'Products'.
- **`singularName`** : Le nom singulier d'une entrée dans la collection. Ex. : 'Product'.
- **`path`** : Chemin Firestore relatif de cette vue à son parent. Si cette vue est à la racine, le chemin est égal à l'absolu. Ce chemin détermine également l'URL dans FireCMS.
- **`properties`** : Objet définissant les propriétés du schéma d'entité. Plus d'informations dans [Propriétés](../properties/properties_intro).
- **`propertiesOrder`** : Ordre dans lequel les propriétés sont affichées.
    - Pour les propriétés, utilisez la clé de propriété.
    - Pour un champ supplémentaire, utilisez la clé du champ.
    - Si vous avez des sous-collections, vous obtenez une colonne par sous-collection, avec le chemin (ou alias) comme sous-collection, préfixé par `subcollection:`. Ex. : `subcollection:orders`.
    - Si vous utilisez un groupe de collection, vous aurez également une colonne supplémentaire `collectionGroupParent`.
    - Notez que si vous définissez cette prop, d'autres façons de masquer des champs, comme `hidden` dans la définition de propriété, seront ignorées. `propertiesOrder` a la priorité sur `hidden`.

  ```typescript
  propertiesOrder: ["name", "price", "subcollection:orders"]
  ```

- **`openEntityMode`** : Détermine comment la vue d'entité est ouverte. Vous pouvez choisir entre `side_panel` (par défaut) ou `full_screen`.
- **`formAutoSave`** : Si défini à true, le formulaire sera auto-sauvegardé quand l'utilisateur change la valeur d'un champ. Par défaut false. Vous ne pouvez pas utiliser cette prop si vous utilisez un `customId`.
- **`collectionGroup`** : Si cette collection est une entrée de navigation de niveau supérieur, vous pouvez définir cette propriété à `true` pour indiquer que c'est un groupe de collection.
- **`alias`** : Vous pouvez définir un alias qui sera utilisé en interne à la place du `path`. La valeur de l'`alias` sera utilisée pour déterminer l'URL de la collection tandis que `path` sera toujours utilisé dans la source de données. Notez que vous pouvez utiliser cette valeur dans les propriétés de référence.
- **`icon`** : Icône à utiliser dans cette collection. Vous pouvez utiliser n'importe quelle icône des specs Material : [Material Icons](https://fonts.google.com/icons). Ex. : 'account_tree' ou 'person'. Trouvez toutes les icônes dans [Icônes](https://firecms.co/docs/icons). Vous pouvez également passer votre propre composant d'icône (`React.ReactNode`).
- **`customId`** : Si cette prop n'est pas définie, l'ID du document sera créé par la source de données. Vous pouvez définir la valeur à 'true' pour forcer les utilisateurs à choisir l'ID.
- **`subcollections`** : Suivant le schéma de documents et collections Firestore, vous pouvez ajouter des sous-collections à votre entité de la même façon que vous définissez les collections racines.
- **`defaultSize`** : Taille par défaut de la collection rendue.
- **`group`** : Champ optionnel utilisé pour regrouper les entrées de navigation de niveau supérieur sous une vue de navigation. Si vous définissez cette valeur dans une sous-collection, elle n'a aucun effet.
- **`description`** : Description optionnelle de cette vue. Vous pouvez utiliser Markdown.
- **`entityActions`** : Vous pouvez définir des actions supplémentaires pouvant être effectuées sur les entités dans cette collection. Ces actions peuvent être affichées dans la vue de collection ou dans la vue d'entité. Vous pouvez utiliser la méthode `onClick` pour implémenter votre propre logique. Dans la prop `context`, vous pouvez accéder à tous les contrôleurs de FireCMS. Vous pouvez également définir des actions d'entité globalement. Voir [Actions d'entité](./entity_actions) pour plus de détails.

```tsx
const archiveEntityAction: EntityAction = {
    icon: <ArchiveIcon/>,
    name: "Archive",
    onClick({
                entity,
                collection,
                context
            }): Promise<void> {
        // Ajoutez votre code ici
        return Promise.resolve(undefined);
    }
}
```

- **`initialFilter`** : Filtres initiaux appliqués à cette collection. Par défaut aucun. Les filtres appliqués avec cette prop peuvent être modifiés par l'utilisateur.

```tsx
initialFilter: {
    age: [">=", 18]
}
```
```tsx
initialFilter: {
    related_user: ["==", new EntityReference("sdc43dsw2", "users")]
}
```

- **`forceFilter`** : Force un filtre dans cette vue. Si appliqué, le reste des filtres sera désactivé. Les filtres appliqués avec cette prop ne peuvent pas être modifiés.

```tsx
forceFilter: {
    age: [">=", 18]
}
```
```tsx
forceFilter: {
    related_user: ["==", new EntityReference("sdc43dsw2", "users")]
}
```

- **`initialSort`** : Tri par défaut appliqué à cette collection. Prend des tuples sous la forme `["nom_propriété", "asc"]` ou `["nom_propriété", "desc"]`.

```tsx
initialSort: ["price", "asc"]
```

- **`Actions`** : Constructeur pour rendre des composants supplémentaires tels que des boutons dans la barre d'outils de collection. Le constructeur prend un objet avec les props `entityCollection` et `selectedEntities` si des entités sont sélectionnées par l'utilisateur final.
- **`pagination`** : Si activé, le contenu est chargé par lots. Si `false`, toutes les entités de la collection sont chargées. Cela signifie qu'en atteignant la fin de la collection, le CMS chargera plus d'entités. Vous pouvez spécifier un nombre pour définir la taille de pagination (50 par défaut). Par défaut `true`.
- **`additionalFields`** : Vous pouvez ajouter des champs supplémentaires à la fois à la vue de collection et à la vue de formulaire en implémentant un délégué de champ supplémentaire.
- **`textSearchEnabled`** : Indicateur pour indiquer si une barre de recherche doit être affichée en haut du tableau de collection.
- **`permissions`** : Vous pouvez spécifier un objet avec des permissions booléennes sous la forme `{edit:boolean; create:boolean; delete:boolean}` pour indiquer les actions que l'utilisateur peut effectuer. Vous pouvez également passer un [`PermissionsBuilder`](../api/type-aliases/PermissionsBuilder) pour personnaliser les permissions basées sur l'utilisateur ou l'entité.
- **`inlineEditing`** : Les éléments de cette collection peuvent-ils être édités en ligne dans la vue de collection ? Si cet indicateur est défini à false mais que `permissions.edit` est `true`, les entités peuvent toujours être éditées dans le panneau latéral.
- **`selectionEnabled`** : Les entités de cette collection sont-elles sélectionnables ? Par défaut `true`.
- **`selectionController`** : Passez votre propre contrôleur de sélection si vous voulez contrôler les entités sélectionnées en externe. [Voir `useSelectionController`](../api/functions/useSelectionController).
- **`exportable`** : Les données de cette vue de collection doivent-elles inclure un bouton d'exportation ? Vous pouvez également définir un objet de configuration [`ExportConfig`](../api/interfaces/ExportConfig) pour personnaliser l'exportation et ajouter des valeurs supplémentaires. Par défaut `true`.
- **`hideFromNavigation`** : Cette collection doit-elle être cachée du panneau de navigation principal si elle est au niveau racine, ou dans le panneau latéral d'entité si c'est une sous-collection ? Elle sera toujours accessible si vous atteignez le chemin spécifié. Vous pouvez également utiliser cette collection comme cible de référence.
- **`callbacks`** : Cette interface définit tous les callbacks qui peuvent être utilisés quand une entité est créée, mise à jour ou supprimée. Utile pour ajouter votre propre logique ou bloquer l'exécution de l'opération. [Plus d'informations](./callbacks).
- **`entityViews`** : Tableau de constructeurs pour rendre des panneaux supplémentaires dans une vue d'entité. Utile si vous avez besoin de rendre des vues personnalisées pour vos entités. [Plus d'informations](./entity_views).
- **`alwaysApplyDefaultValues`** : Si défini à true, les valeurs par défaut des propriétés seront appliquées à l'entité chaque fois qu'elle est mise à jour (pas seulement lors de la création). Par défaut false.
- **`databaseId`** : ID de base de données optionnel de cette collection. Si non spécifié, l'ID de base de données par défaut sera utilisé. Utile quand on travaille avec plusieurs bases de données.
- **`previewProperties`** : Propriétés d'aperçu par défaut affichées quand cette collection est référencée.
- **`titleProperty`** : Propriété de titre de l'entité. Cette propriété sera utilisée comme titre dans les vues d'entité et références. Si non spécifiée, la première propriété de texte simple sera utilisée.
- **`defaultSelectedView`** : Si vous voulez ouvrir des vues personnalisées ou des sous-collections par défaut lors de l'ouverture d'une entité, spécifiez le chemin ici. Peut être une chaîne ou une fonction constructeur.
- **`hideIdFromForm`** : L'ID de cette collection doit-il être caché de la vue formulaire.
- **`hideIdFromCollection`** : L'ID de cette collection doit-il être caché de la vue grille.
- **`sideDialogWidth`** : Largeur du dialogue latéral (en pixels ou chaîne) lors de l'ouverture d'une entité dans cette collection.
- **`editable`** : La configuration de cette collection peut-elle être modifiée par l'utilisateur final. Par défaut `true`. N'a d'effet que si vous utilisez l'éditeur de collection.
- **`includeJsonView`** : Si défini à true, un onglet avec la représentation JSON de l'entité sera inclus.
- **`history`** : Si défini à true, les modifications de l'entité seront sauvegardées dans une sous-collection. Cette prop n'a aucun effet si le plugin d'historique n'est pas activé.
- **`localChangesBackup`** : Les modifications locales doivent-elles être sauvegardées dans le stockage local pour éviter la perte de données. Options : `"manual_apply"` (demander à restaurer), `"auto_apply"` (restaurer automatiquement), ou `false`. Par défaut `"manual_apply"`.
- **`defaultViewMode`** : Mode de vue par défaut pour afficher cette collection. Options : `"table"` (type tableur, par défaut), `"cards"` (grille de cartes avec miniatures), `"kanban"` (tableau regroupé par propriété).
- **`kanban`** : Configuration pour le mode de vue tableau Kanban. Nécessite une `columnProperty` référençant une propriété enum. Quand défini, le mode de vue Kanban devient disponible.

```tsx
kanban: {
    columnProperty: "status" // Doit référencer une propriété de chaîne avec enumValues
}
```

- **`orderProperty`** : Clé de propriété à utiliser pour ordonner les éléments. Doit référencer une propriété de nombre. Quand les éléments sont réordonnés, cette propriété sera mise à jour pour refléter le nouvel ordre en utilisant l'indexage fractionnaire. Utilisée par la vue Kanban pour l'ordre au sein des colonnes.
