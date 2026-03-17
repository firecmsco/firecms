---
title: Kollektionsgruppen
sidebar_label: Kollektionsgruppen
---

Sie können jetzt Firestore-Kollektionsgruppen in FireCMS verwenden. Dies ermöglicht Ihnen,
kollektionsübergreifende Abfragen mit demselben Namen durchzuführen. Zum Beispiel könnten Sie
eine Kollektionsgruppe namens `products` haben, die alle Produkte
aus verschiedenen `stores` enthält.

In unserem Demo-Projekt haben wir eine Kollektionsgruppe namens `locales`, die
alle Lokalisierungen für die verschiedenen `products` enthält.

Sehen Sie das Demo-Projekt [hier](https://demo.firecms.co/c/locales).

FireCMS generiert eine zusätzliche Spalte in der Kollektionsansicht mit
Referenzen zu allen übergeordneten Kollektionen, die Teil der
Konfiguration sind.

Um Kollektionsgruppen zu verwenden, müssen Sie die `collectionGroup`-Eigenschaft
in der `Collection`-Konfiguration angeben.

```tsx
export const localeCollectionGroup = buildCollection({
    name: "Product locales group",
    path: "locales",
    description: "This is a collection group related to the locales subcollection of products",
    collectionGroup: true,
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        // ...
    },
});
```

:::note
Je nach Ihren Firestore-Regeln müssen Sie möglicherweise eine weitere
Regel hinzufügen, um Kollektionsgruppenabfragen zu erlauben. Zum Beispiel:

```text
match /{path=**}/locales/{document=**} {
  allow read, write: if true;
}
```

Wenn eine Kollektionsgruppenabfrage durchgeführt wird, lautet der Pfad etwa
`/products/{productId}/locales/{localeId}`. Aber die Abfrage geht an alle 
Kollektionen namens `locales` in Ihrer Datenbank. Deshalb müssen Sie möglicherweise
eine Regel wie die oben genannte hinzufügen.
:::
