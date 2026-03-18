---
title: Viste entità
slug: it/docs/collections/entity_views
sidebar_label: Viste entità
description: FireCMS ti permette di aggiungere viste personalizzate per entità.
---

![Custom entity view](/img/entity_view.png)

FireCMS offre campi form e tabella predefiniti per i casi d'uso comuni e consente anche di sovrascrivere i campi se hai bisogno di un'implementazione personalizzata, ma questo potrebbe non essere sufficiente in certi casi, dove potresti voler avere una **vista personalizzata completa correlata a una singola entità**.

I casi d'uso tipici per questo sono:

- **Anteprima** di un'entità in un formato specifico.
- Vedere come appaiono i dati in una **pagina web**.
- Definire una **dashboard**.
- Modificare lo stato del **form**.
- ... o qualsiasi altra vista personalizzata di cui potresti aver bisogno.

Quando la tua vista entità è definita, puoi aggiungerla direttamente alla collezione o includerla nel registro delle viste entità.

### Definire una vista entità personalizzata

Per farlo, puoi passare un array di `EntityCustomView` al tuo schema. Come in questo esempio:

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
        // Questo è un componente personalizzato che puoi costruire come qualsiasi componente React
        <MyBlogPreviewComponent entity={entity}
                                modifiedValues={modifiedValues}/>
    )
};
```

### Costruire un form secondario

![Custom entity view](/img/entity_view_secondary_form.png)

Nelle tue viste personalizzate, puoi anche aggiungere campi che vengono mappati direttamente all'entità. Questo è utile se vuoi aggiungere un form secondario alla tua vista entità.

Puoi aggiungere qualsiasi campo, usando il componente `PropertyFieldBinding`. Questo componente legherà il valore all'entità e verrà salvato quando l'entità viene salvata.

In questo esempio creiamo un form secondario con un campo mappa, inclusi nome ed età:

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

Poi aggiungi la tua vista personalizzata alla collezione:

```tsx
export const testCollection = buildCollection<any>({
    id: "users",
    path: "users",
    name: "Users",
    properties: {
        // ... le tue proprietà blog qui
    },
    entityViews: [{
        key: "user_details",
        name: "Details",
        includeActions: true, // questa prop ti permette di includere le azioni predefinite nella barra inferiore
        Builder: SecondaryForm
    }]
});
```

Nota che puoi usare la prop `includeActions` per includere le azioni predefinite nella barra inferiore della vista, in modo che l'utente non debba tornare alla vista form principale per eseguire azioni come salvare o eliminare l'entità.


### Aggiungere la tua vista entità direttamente alla collezione

Se stai modificando una collezione nel codice, puoi aggiungere la tua vista personalizzata direttamente alla collezione:

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
                // Questo è un componente personalizzato che puoi costruire come qualsiasi componente React
                <MyBlogPreviewComponent entity={entity}
                                        modifiedValues={modifiedValues}/>
            )
        }
    ],
    properties: {
        // ... le tue proprietà blog qui
    }
});
```

### Aggiungere la tua vista entità al registro delle viste entità

Potresti avere una vista entità che vuoi riutilizzare in diverse collezioni.

#### FireCMS Cloud

In FireCMS Cloud, puoi aggiungerla al registro delle viste entità nel tuo export principale `FireCMSAppConfig`:

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... le tue collezioni qui
        ]);
    },
    entityViews: [{
        key: "test-view",
        name: "Test",
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>La tua vista</div>
    }]
}

export default appConfig;
```

#### FireCMS PRO

In FireCMS PRO, puoi aggiungerla al registro delle viste entità nel tuo componente `FireCMS` principale:

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
                  }) => <div>La tua vista</div>
    }]}
    //...
/>
```

#### Usando una vista registrata

Questo renderà la vista entità disponibile nell'editor UI delle collezioni. È anche possibile usare la prop `entityView` nella collezione con la chiave della vista entità che vuoi usare:

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: ["test-view"],
    properties: {
        // ... le tue proprietà blog qui
    }
});
```
