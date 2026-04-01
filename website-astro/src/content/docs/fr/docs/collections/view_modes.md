---
title: Modes d'affichage des collections
slug: fr/docs/collections/view_modes
sidebar_label: Modes d'affichage
description: Affichez vos collections sous forme de tableaux, de cartes ou de tableaux Kanban dans FireCMS. Choisissez la vue qui correspond à vos données.
---

FireCMS offre trois façons différentes de visualiser vos collections. Chaque mode d'affichage est optimisé pour différents types de données et de flux de travail.

![Collection View Modes](/img/blog/kanban_settings.png)

## Modes d'affichage disponibles

| Mode d'affichage | Description | Idéal pour |
|------------------|-------------|------------|
| **Tableau** | Grille de type tableur avec édition en ligne | Données denses, opérations en masse, enregistrements détaillés |
| **Cartes** | Grille réactive affichant des miniatures et des champs clés | Contenu visuel, catalogues de produits, médiathèques |
| **Kanban** | Tableau avec colonnes basées sur un champ de statut/catégorie | Flux de travail, gestion de tâches, pipelines de commandes |

## Définir l'affichage par défaut

Utilisez la propriété `defaultViewMode` dans la configuration de votre collection :

```typescript
const productsCollection = buildCollection({
    path: "products",
    name: "Products",
    defaultViewMode: "cards", // "table" | "cards" | "kanban"
    properties: {
        // ...
    }
});
```

Les utilisateurs peuvent toujours basculer entre les vues en utilisant le sélecteur de vue dans la barre d'outils de collection — `defaultViewMode` définit simplement ce qu'ils voient en premier.

---

## Restreindre les vues disponibles

Par défaut, les trois modes d'affichage sont disponibles. Utilisez `enabledViews` pour restreindre quelles vues apparaissent dans le sélecteur :

```typescript
const ordersCollection = buildCollection({
    path: "orders",
    name: "Orders",
    enabledViews: ["table", "kanban"], // La vue Cartes ne sera pas disponible
    properties: {
        // ...
    }
});
```

:::note
La vue Kanban est automatiquement disponible pour toute collection qui a au moins une propriété de chaîne avec des `enumValues` définies. Si aucune propriété enum n'existe, Kanban n'apparaîtra pas dans le sélecteur même s'il est inclus dans `enabledViews`.
:::

---

## Vue Tableau

Le mode d'affichage par défaut. Affiche les entités dans une grille de type tableur avec prise en charge de :
- L'édition en ligne
- Le tri et le filtrage
- Le redimensionnement et la réorganisation des colonnes
- La sélection groupée

**Idéal pour :** Listes d'utilisateurs, journaux de transactions, données analytiques, toute collection où vous devez voir de nombreux champs à la fois.

---

## Vue Cartes

Transforme votre collection en une grille réactive de cartes. Chaque carte affiche :
- Des miniatures d'images (automatiquement détectées à partir des propriétés d'image)
- Le titre et les métadonnées clés
- Des actions rapides

![Cards View Example](/img/blog/cards_view_plants.png)

### Activer la vue Cartes

```typescript
const productsCollection = buildCollection({
    path: "products",
    name: "Products",
    defaultViewMode: "cards",
    properties: {
        name: buildProperty({ dataType: "string", name: "Name" }),
        image: buildProperty({ 
            dataType: "string", 
            storage: { mediaType: "image", storagePath: "products" } 
        }),
        price: buildProperty({ dataType: "number", name: "Price" })
    }
});
```

**Idéal pour :** Catalogues de produits, articles de blog, médiathèques, annuaires d'équipes, portfolios — toute collection avec des images.

---

## Vue Kanban

Affiche les entités comme des cartes organisées en colonnes basées sur une propriété enum. Glissez et déposez les cartes entre les colonnes pour mettre à jour leur statut.

![Kanban View in Action](/img/blog/kanban_view.png)

### Détection automatique

La vue Kanban est **automatiquement disponible** pour toute collection qui a au moins une propriété de chaîne avec des `enumValues` définies. Aucune configuration supplémentaire n'est requise — définissez simplement votre propriété enum et l'option Tableau apparaîtra dans le sélecteur de vue.

### Définir une propriété de colonne par défaut

Quand votre collection a plusieurs propriétés enum, vous pouvez définir laquelle est utilisée pour les colonnes par défaut avec la configuration `kanban`. Les utilisateurs peuvent basculer entre les propriétés enum depuis le sélecteur de vue.

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: {
        columnProperty: "status" // Optionnel : pré-sélectionne l'enum pour le regroupement
    },
    properties: {
        title: buildProperty({ dataType: "string", name: "Task" }),
        status: buildProperty({
            dataType: "string",
            name: "Status",
            enumValues: {
                todo: "To Do",
                in_progress: "In Progress",
                review: "Review",
                done: "Done"
            }
        })
    }
});
```

### Réorganisation par glisser-déposer

Pour activer la réorganisation des cartes dans une colonne, ajoutez une `orderProperty` :

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: { columnProperty: "status" },
    orderProperty: "order", // Doit référencer une propriété de nombre
    properties: {
        title: buildProperty({ dataType: "string", name: "Task" }),
        status: buildProperty({
            dataType: "string",
            name: "Status",
            enumValues: { todo: "To Do", in_progress: "In Progress", done: "Done" }
        }),
        order: buildProperty({ dataType: "number", name: "Order" })
    }
});
```

La `orderProperty` utilise l'indexage fractionnaire pour maintenir l'ordre sans réécrire chaque document à chaque réorganisation.

:::caution[Index Firestore requis]
Lors de l'utilisation de la vue Kanban avec Firestore, vous aurez besoin d'un index composite sur votre propriété de colonne. Firestore vous proposera le lien exact vers l'index lors du premier chargement de la vue.
:::

**Idéal pour :** Gestion de tâches, traitement des commandes, pipelines de contenu, tickets de support, flux d'embauche — toute collection avec des étapes distinctes.

---

## Configuration dans FireCMS Cloud

Si vous utilisez FireCMS Cloud, vous pouvez configurer les modes d'affichage via l'interface sans écrire de code :

1. Ouvrez les paramètres de votre collection
2. Allez dans l'onglet **Affichage**
3. Sélectionnez votre **Vue de collection par défaut** (Tableau, Cartes ou Kanban)
4. Pour Kanban, choisissez la **Propriété de colonne Kanban** et optionnellement une **Propriété d'ordre**

![Kanban Settings in FireCMS Cloud](/img/blog/kanban_settings.png)
