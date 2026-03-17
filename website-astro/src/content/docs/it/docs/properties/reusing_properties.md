---
title: Riutilizzare le configurazioni delle proprietà
---

:::tip
Quando definisci una config di proprietà, potrai selezionarla nell'editor delle collezioni
:::

FireCMS 3 ha introdotto un nuovo modo di definire le proprietà che ti consente di riutilizzarle in diverse entità e collezioni.

Puoi definire un oggetto `propertyConfigs` che contiene tutte le configurazioni relative a una proprietà. Questo è un array di oggetti `PropertyConfig`, definiti come segue:

```typescript
export type PropertyConfig<T extends CMSType = any> = {

    /**
     * Chiave usata per identificare questa config di proprietà.
     */
    key: string,

    /**
     * Nome di questo tipo di campo.
     * Non è il nome della proprietà.
     */
    name: string;

    /**
     * Config predefinita per la proprietà.
     * Questa proprietà o builder verrà usata come valori base per la proprietà risultante.
     * Puoi anche usare una funzione builder per generare la proprietà base.
     * Puoi anche definire un Field personalizzato come componente React.
     */
    property: PropertyOrBuilder<T>;

    /**
     * Icona opzionale da usare nel selettore di campi.
     * Usa un componente 24x24.
     */
    Icon?: React.ComponentType;

    /**
     * Colore CSS, usato solo in alcuni plugin come il selettore di campi.
     * Es. "#2d7ff9"
     */
    color?: string;

    /**
     * Descrizione di questo tipo di campo.
     */
    description?: string;

}
```

Nota che puoi usare qualsiasi dei builder o proprietà esistenti come base per la tua proprietà personalizzata. Ciò che definisci nella tua proprietà verrà usato come base per la proprietà risultante (l'utente può ancora personalizzarla).

### FireCMS Cloud

Definiamo una proprietà personalizzata che consiste in un oggetto mappa di traduzioni con diversi valori stringa:

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

In FireCMS PRO, puoi definire i `propertyConfigs` nel componente `FireCMS`:

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
