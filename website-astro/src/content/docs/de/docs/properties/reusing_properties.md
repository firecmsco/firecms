---
title: Eigenschaftskonfigurationen wiederverwenden
---

:::tip
Wenn Sie eine Eigenschaftskonfiguration definieren, können Sie sie im
Kollektion-Editor auswählen.
:::

FireCMS 3 hat eine neue Möglichkeit eingeführt, Eigenschaften zu definieren, die es Ihnen ermöglicht, diese
in verschiedenen Entities und Kollektionen wiederzuverwenden.

Sie können ein `propertyConfigs`-Objekt definieren, das alle Konfigurationen zu einer Eigenschaft enthält.
Dies ist ein Array von `PropertyConfig`-Objekten:

```typescript
export type PropertyConfig<T extends CMSType = any> = {

    /**
     * Schlüssel zur Identifizierung dieser Eigenschaftskonfiguration.
     */
    key: string,

    /**
     * Name dieses Feldtyps.
     * Dies ist nicht der Name der Eigenschaft.
     */
    name: string;

    /**
     * Standardkonfiguration für die Eigenschaft.
     */
    property: PropertyOrBuilder<T>;

    /**
     * Optionales Symbol für den Feldselektor.
     */
    Icon?: React.ComponentType;

    /**
     * CSS-Farbe.
     * z.B. "#2d7ff9"
     */
    color?: string;

    /**
     * Beschreibung dieses Feldtyps.
     */
    description?: string;

}
```

### FireCMS Cloud

Definieren wir eine benutzerdefinierte Eigenschaft als Übersetzungs-Map-Objekt mit verschiedenen String-Werten:

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

In FireCMS PRO können Sie die `propertyConfigs` in der `FireCMS`-Komponente definieren:

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
