---
title: Vues d'entité
sidebar_label: Vues d'entité
description: FireCMS vous permet d'ajouter des vues personnalisées par entité. Que vous créiez des aperçus, des visualisations de pages web, des tableaux de bord, des modifications de formulaires ou toute autre vue distinctive, les vues d'entité personnalisées de FireCMS répondent à vos besoins uniques.
---

![Custom entity view](/img/entity_view.png)

FireCMS offre des champs de formulaire et de tableau par défaut pour les cas d'utilisation courants et permet également
de remplacer les champs si vous avez besoin d'une implémentation personnalisée, mais cela peut ne pas être
suffisant dans certains cas, où vous pourriez vouloir avoir une **vue personnalisée complète liée
à une entité**.

Les cas d'utilisation typiques pour cela sont :

- **Aperçu** d'une entité dans un format spécifique.
- Vérification de l'aspect des données dans une **page web**.
- Définition d'un **tableau de bord**.
- Modification de l'état du **formulaire**.
- ... ou toute autre vue personnalisée dont vous pourriez avoir besoin.

Quand votre vue d'entité est définie, vous pouvez l'ajouter directement à la collection
ou l'inclure dans le registre de vues d'entité.

### Définir une vue d'entité personnalisée

Pour y parvenir, vous pouvez passer un tableau de `EntityCustomView`
à votre schéma. Comme dans cet exemple :

```tsx
import React from "react";
import { EntityCustomView, buildCollection } from "@firecms/core";

const sampleView: EntityCustomView = {
    key: "preview",
    name: "Blog entry preview",
    Builder: ({
                  collection,
                  entity,
                  modifiedValues,
                  formContext
              }) => (
        // Il s'agit d'un composant personnalisé que vous pouvez construire comme n'importe quel composant React
        <MyBlogPreviewComponent entity={entity}
                                modifiedValues={modifiedValues}/>
    )
};
```

### Construire un formulaire secondaire

![Custom entity view](/img/entity_view_secondary_form.png)

Dans vos vues personnalisées, vous pouvez également ajouter des champs qui sont mappés directement à l'entité.
C'est utile si vous voulez ajouter un formulaire secondaire à votre vue d'entité.

Vous pouvez ajouter n'importe quel champ en utilisant le composant `PropertyFieldBinding`. Ce composant
liera la valeur à l'entité, et elle sera sauvegardée quand l'entité est sauvegardée.

Dans cet exemple, nous créons un formulaire secondaire avec un champ map, incluant nom et âge :

```tsx
import { EntityCustomViewParams, PropertyFieldBinding } from "@firecms/core";
import { Container } from "@firecms/ui";

export function SecondaryForm({
                                  formContext
                              }: EntityCustomViewParams) {

    return (
        <Container className={"my-16"}>
            <PropertyFieldBinding context={formContext}
                                  propertyKey={"myTestMap"}
                                  property={{
                                      dataType: "map",
                                      name: "My test map",
                                      properties: {
                                          name: {
                                              name: "Name",
                                              dataType: "string",
                                              validation: { required: true }
                                          },
                                          age: {
                                              name: "Age",
                                              dataType: "number",
                                          }
                                      }
                                  }}/>
        </Container>
    );
}
```

Ajoutez ensuite votre vue personnalisée à la collection :

```tsx
export const testCollection = buildCollection<any>({
    id: "users",
    path: "users",
    name: "Users",
    properties: {
        // ... vos propriétés blog ici
    },
    entityViews: [{
        key: "user_details",
        name: "Details",
        includeActions: true, // cette prop vous permet d'inclure les actions par défaut dans la barre inférieure
        Builder: SecondaryForm
    }]
});
```

Notez que vous pouvez utiliser la prop `includeActions` pour inclure les actions par défaut dans la barre inférieure de la vue,
afin que l'utilisateur n'ait pas besoin de retourner à la vue de formulaire principale pour effectuer des actions comme sauvegarder ou supprimer l'entité.


### Ajouter votre vue d'entité directement à la collection

Si vous éditez une collection en code, vous pouvez ajouter votre vue personnalisée
directement à la collection :

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: [
        {
            key: "preview",
            name: "Blog entry preview",
            Builder: ({
                          collection,
                          entity,
                          modifiedValues
                      }) => (
                // Il s'agit d'un composant personnalisé que vous pouvez construire comme n'importe quel composant React
                <MyBlogPreviewComponent entity={entity}
                                        modifiedValues={modifiedValues}/>
            )
        }
    ],
    properties: {
        // ... vos propriétés blog ici
    }
});
```

### Ajouter votre vue d'entité au registre de vues d'entité

Vous pourriez avoir une vue d'entité que vous souhaitez réutiliser dans différentes collections.

#### FireCMS Cloud

Dans FireCMS Cloud, vous pouvez l'ajouter au registre de vues d'entité dans votre
export principal `FireCMSAppConfig` :

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... vos collections ici
        ]);
    },
    entityViews: [{
        key: "test-view",
        name: "Test",
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>Your view</div>
    }]
}

export default appConfig;
```

#### FireCMS PRO

Dans FireCMS PRO, vous pouvez l'ajouter au registre de vues d'entité dans votre
composant principal `FireCMS` :

```tsx
//...
<FireCMS
    //...
    entityViews={[{
        key: "test-view",
        name: "Test",
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>Your view</div>
    }]}
    //...
/>
```

#### Utiliser la vue enregistrée

Cela rendra la vue d'entité disponible dans l'éditeur de collection UI.
Il est également possible d'utiliser la prop `entityView` dans la collection
avec la clé de la vue d'entité que vous souhaitez utiliser :

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: ["test-view"],
    properties: {
        // ... vos propriétés blog ici
    }
});
```
