---
slug: fr/docs/properties/reusing_properties
title: Réutilisation des configurations de propriétés
---

:::tip
Quand vous définissez une configuration de propriété, vous pourrez la sélectionner dans
l'éditeur de collection
:::

FireCMS 3 a introduit une nouvelle façon de définir des propriétés qui vous permet de les réutiliser
dans différentes entités et collections.

Vous pouvez définir un objet `propertyConfigs` qui
contient toutes les configurations liées à une propriété. C'est un tableau de
d'objets `PropertyConfig`, qui sont définis comme suit :

```typescript
export type PropertyConfig<T extends CMSType = any> = {

    /**
     * Clé utilisée pour identifier cette configuration de propriété.
     */
    key: string,

    /**
     * Nom de ce type de champ.
     * Ce n'est pas le nom de la propriété.
     */
    name: string;

    /**
     * Configuration par défaut pour la propriété.
     * Cette propriété ou constructeur sera utilisé comme valeurs de base pour la propriété résultante.
     * Vous pouvez également utiliser une fonction constructeur pour générer la propriété de base.
     * Vous pouvez utiliser une fonction constructeur pour générer la propriété en fonction des valeurs ou du chemin.
     * Vous pouvez également définir un Field personnalisé comme composant React à utiliser pour cette propriété.
     */
    property: PropertyOrBuilder<T>;

    /**
     * Icône optionnelle à utiliser dans le sélecteur de champs.
     * Utilisez un composant 24x24 pour ne pas casser la mise en page.
     * N'importe quelle icône FireCMS peut être utilisée.
     */
    Icon?: React.ComponentType;

    /**
     * Couleur CSS, utilisée uniquement dans certains plugins comme le sélecteur de champs.
     * ex. "#2d7ff9"
     */
    color?: string;

    /**
     * Description de ce type de champ.
     */
    description?: string;

}
```

Notez que vous pouvez utiliser n'importe lequel des constructeurs ou propriétés existants comme base pour
votre propriété personnalisée. Ce que vous définissez dans votre propriété sera utilisé comme base
pour la propriété résultante (l'utilisateur peut toujours la personnaliser).

### FireCMS Cloud

Définissons une propriété personnalisée qui consiste en un objet map de traductions avec différentes valeurs de chaîne :

```typescript

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: [
        // ...
    ],
    propertyConfigs: [
        {
            name: "Translated string",
            key: "translated_string",
            property: {
                dataType: "map",
                properties: {
                    en: {
                        dataType: "string",
                        name: "English"
                    },
                    es: {
                        dataType: "string",
                        name: "Español"
                    },
                },
            },
        }
    ]
};
```

### FireCMS PRO

Dans FireCMS PRO, vous pouvez définir les `propertyConfigs` dans le composant `FireCMS` :

```tsx
<FireCMS
    //...
    propertyConfigs={[
        {
            name: "Translated string",
            key: "translated_string",
            property: {
                dataType: "map",
                properties: {
                    en: {
                        dataType: "string",
                        name: "English"
                    },
                    es: {
                        dataType: "string",
                        name: "Español"
                    },
                },
            },
        }
    ]}
/>
```
