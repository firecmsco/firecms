---
title: Kollektionen
sidebar_label: Collections
description: Definieren Sie Ihr Firestore-Datenschema mit FireCMS-Kollektionen. Erstellen Sie typsichere Admin-Panels für Firebase mit React und TypeScript.
---

**Kollektionen** sind die zentralen Bausteine Ihres FireCMS **Admin-Panels**. Sie definieren, wie Ihre **Firestore-Daten** in der CMS-Benutzeroberfläche angezeigt, bearbeitet und verwaltet werden.

Wenn Sie ein **Headless CMS** oder **Back-Office** für Ihr **Firebase**-Projekt erstellen, definieren Kollektionen:
- **Welche Daten** Benutzer verwalten können (Produkte, Benutzer, Artikel, Bestellungen usw.)
- **Wie diese Daten aussehen** in Formularen und Tabellen (Feldtypen, Validierung, Layout)
- **Wer was tun darf** (Erstellen, Lesen, Aktualisieren, Löschen-Berechtigungen)
- **Benutzerdefinierte Logik** (Callbacks beim Speichern, berechnete Felder, Nebeneffekte)

:::tip[Warum FireCMS-Kollektionen verwenden?]
Im Gegensatz zu traditionellen CMSs, die ein starres Datenmodell auferlegen, bilden FireCMS-Kollektionen Ihre bestehende **Firestore**-Struktur direkt ab. Das bedeutet, dass Sie jeder Firebase-App eine leistungsstarke **React-basierte Admin-UI** hinzufügen können, ohne Ihre Daten zu migrieren oder Ihr Schema zu ändern.
:::

Kollektionen erscheinen auf der **obersten Ebene** der Navigation (Startseite und Schublade) oder als **Unterkollektionen** unter übergeordneten Entities.

Sie können Kollektionen auf zwei Arten definieren:
- **No-Code**: Verwenden Sie den eingebauten **Collection Editor UI** (erfordert entsprechende Berechtigungen)
- **Code-First**: Definieren Sie Kollektionen programmatisch mit vollständiger **TypeScript**-Unterstützung

## Ihre Kollektionen definieren

Sie können Ihre Kollektionen **in der UI oder mit Code** erstellen. Sie können auch beide Ansätze mischen, aber beachten Sie, dass Kollektionen, die in der UI definiert sind, Vorrang haben.

:::important
Sie können dieselbe Kollektion auf beide Arten definieren. In diesem Fall hat die in der UI definierte Kollektion Vorrang.

Es wird ein Deep-Merge durchgeführt, sodass Sie einige Eigenschaften im Code definieren und sie in der UI überschreiben können.
:::

### Beispiel-Kollektion in Code

:::note
FireCMS bietet etwa 20 verschiedene Felder (wie Textfelder, Auswahllisten und komplexe Felder wie Referenz oder sortierbare Array-Felder). Wenn Ihr Anwendungsfall nicht durch eines der bereitgestellten Felder abgedeckt ist, können Sie Ihr eigenes [benutzerdefiniertes Feld](../properties/custom_fields.mdx) erstellen.
:::

:::tip
Sie müssen `buildCollection` oder `buildProperty` nicht zum Erstellen der Konfiguration verwenden. Es handelt sich um Identity-Funktionen, die Ihnen helfen, Typ- und Konfigurationsfehler zu erkennen.
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
  description: "Liste der aktuell in unserem Shop verkauften Produkte",
  textSearchEnabled: true,
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
        storagePath: "images",
        acceptedFiles: ["image/*"]
      }
    }),
    available: buildProperty({
      dataType: "boolean",
      name: "Available",
      description: "Ist dieses Produkt auf Lager?"
    }),
    price: buildProperty(({ values }) => ({
      dataType: "number",
      name: "Price",
      validation: {
        requiredMessage: "Sie müssen einen Preis festlegen",
        min: 0,
        max: 10000
      },
      disabled: !values.available && {
        clearOnDisabled: true,
        disabledMessage: "Sie können den Preis nur für verfügbare Artikel festlegen"
      }
    })),
    related_products: buildProperty({
      dataType: "array",
      name: "Related products",
      of: {
        dataType: "reference",
        path: "products"
      }
    }),
    publisher: buildProperty({
      name: "Publisher",
      description: "Verlag dieses Produkts",
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
  }
});
```

## Kollektionen in FireCMS registrieren

### FireCMS Cloud

```typescript
export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: [
        productsCollection
    ]
};
```

### FireCMS PRO oder Community

```tsx
const navigationController = useBuildNavigationController({
    collections: [
        productsCollection
    ]
});
```

## Unterkollektionen

Sie können Unterkollektionen definieren, die unter einem Entity-Pfad verschachtelt sind:

```tsx
const productsCollection = buildCollection({
    id: "products",
    path: "products",
    name: "Products",
    subcollections: [
        buildCollection({
            id: "reviews",
            path: "reviews",
            name: "Reviews",
            properties: {
                body: buildProperty({
                    name: "Review body",
                    dataType: "string",
                    multiline: true
                })
            }
        })
    ],
    properties: {
        // ...
    }
});
```
