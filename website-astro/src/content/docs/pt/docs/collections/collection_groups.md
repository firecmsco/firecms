---
slug: pt/docs/collections/collection_groups
title: Gruppi di collezioni
sidebar_label: Gruppi di collezioni
---

Puoi ora usare i gruppi di collezioni Firestore in FireCMS. Questo ti permette di interrogare attraverso più collezioni con lo stesso nome. Ad esempio, potresti avere un gruppo di collezioni chiamato `products` che contiene tutti i prodotti da diversi `stores`.

Nel nostro progetto demo, abbiamo un gruppo di collezioni chiamato `locales` che contiene tutte le localizzazioni per i diversi `products`.

Vedi il progetto demo [qui](https://demo.firecms.co/c/locales).

FireCMS genererà una colonna aggiuntiva nella vista collezione con riferimenti a tutte le collezioni genitore che fanno parte della configurazione.

Per usare i gruppi di collezioni, devi specificare la proprietà `collectionGroup` nella configurazione `Collection`.

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
A seconda delle tue regole Firestore, potresti dover aggiungere un'altra regola per consentire le query sui gruppi di collezioni. Ad esempio:

```text
match /{path=**}/locales/{document=**} {
  allow read, write: if true;
}
```

Quando si esegue una query su un gruppo di collezioni, il percorso sarà qualcosa come `/products/{productId}/locales/{localeId}`. Ma la query andrà a tutte le collezioni chiamate `locales` nel tuo database. Ecco perché potresti dover aggiungere una regola come quella sopra.
:::
