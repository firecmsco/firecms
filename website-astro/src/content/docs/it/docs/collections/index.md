---
title: Collezioni
sidebar_label: Collezioni
description: Definisci il tuo schema dati Firestore con le collezioni FireCMS. Crea pannelli admin type-safe per Firebase con React e TypeScript.
---

Le **Collezioni** sono i mattoni fondamentali del tuo **pannello admin** FireCMS. Definiscono come i tuoi **dati Firestore** vengono visualizzati, modificati e gestiti nell'interfaccia CMS.

Se stai costruendo un **CMS headless** o un **back-office** per il tuo progetto **Firebase**, le collezioni sono dove definisci:
- **Quali dati** gli utenti possono gestire (prodotti, utenti, articoli, ordini, ecc.)
- **Come appaiono quei dati** nei form e nelle tabelle (tipi di campo, validazione, layout)
- **Chi può fare cosa** (permessi di creazione, lettura, aggiornamento, eliminazione)
- **Logica personalizzata** (callback al salvataggio, campi calcolati, effetti collaterali)

:::tip[Perché usare le collezioni FireCMS?]
A differenza dei CMS tradizionali che impongono un modello dati rigido, le collezioni FireCMS mappano direttamente alla tua struttura **Firestore** esistente. Questo significa che puoi aggiungere una potente **UI admin basata su React** a qualsiasi progetto Firebase senza migrare i tuoi dati o cambiare il tuo schema.
:::

Le collezioni appaiono al **livello superiore** della navigazione (home page e drawer), o come **sottoCollezioni** annidate sotto le entità padre.

Puoi definire le collezioni in due modi:
- **No-code**: Usa l'**Editor UI Collezioni** integrato (richiede le autorizzazioni appropriate)
- **Prima del codice**: Definisci le collezioni programmaticamente con pieno supporto **TypeScript** e accesso a tutte le funzionalità avanzate (callback, campi personalizzati, proprietà calcolate)

## Definire le tue collezioni

Puoi creare le tue collezioni **nell'UI o usando il codice**. Puoi anche mescolare entrambi gli approcci, ma tieni presente che le collezioni definite nell'UI avranno la precedenza. Ad esempio, potresti avere una proprietà enum con 2 valori definiti nel codice e un valore extra definito nell'UI. Quando fusi, l'enum risultante avrà 3 valori.

:::important
Puoi avere la stessa collezione definita in entrambi i modi. In tal caso, la collezione definita nell'UI avrà la precedenza.

Viene eseguita una fusione profonda, quindi puoi definire alcune proprietà nel codice e sovrascriverle nell'UI. Ad esempio, puoi definire una proprietà stringa enum e i valori verranno fusi da entrambe le definizioni.
:::

### Esempio di collezione definita nel codice

:::note
FireCMS fornisce circa 20 campi diversi (come campi di testo, selettori e quelli complessi come riferimento o campi array ordinabili). Se il tuo caso d'uso non è coperto da uno dei campi forniti, puoi creare il tuo [campo personalizzato](../properties/custom_fields.mdx).
:::

:::tip
Non è necessario usare `buildCollection` o `buildProperty` per costruire la configurazione. Sono funzioni identità che ti aiuteranno a rilevare errori di tipo e configurazione.
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

In FireCMS Cloud, questa collezione può essere usata includendola nella prop `collections` del tuo export principale, un oggetto `FireCMSAppConfig`.

In FireCMS PRO, le `collections` vengono passate direttamente all'hook `useBuildNavigationController`.

### Modificare una collezione definita nell'UI

Se hai solo bisogno di aggiungere del codice a una collezione definita nell'UI, puoi usare la funzione `modifyCollection` nel tuo oggetto `FireCMSAppConfig`.

Questo si applica **solo a FireCMS Cloud**.

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... collezioni definite in codice completo qui
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

Puoi usare tutte le props disponibili nell'interfaccia `Collection`.

## Sottocolelzioni

Le sotto-collezioni sono collezioni di entità che si trovano sotto un'altra entità. Ad esempio, puoi avere una collezione chiamata "translations" sotto l'entità "Article". Devi solo usare lo stesso formato per definire la tua collezione usando il campo `subcollections`.

Le sotto-collezioni sono facilmente accessibili dalla vista laterale mentre si modifica un'entità.

## Filtri

:::tip
Se hai bisogno di applicare alcuni filtri e ordinamenti per impostazione predefinita, puoi usare le props `initialFilter` e `initialSort`. Puoi anche forzare una combinazione di filtri da applicare sempre usando la prop `forceFilter`.
:::

Il filtraggio è abilitato per impostazione predefinita per stringhe, numeri, booleani, date e array. In ogni colonna della collezione è incluso un dropdown dove applicabile.

Poiché Firestore ha capacità di query limitate, ogni volta che applichi un filtro o un nuovo ordinamento, la combinazione precedente di ordinamento/filtro viene reimpostata per impostazione predefinita (a meno che non si stia filtrando o ordinando per la stessa proprietà).

Se hai bisogno di abilitare il filtraggio/ordinamento per più di una proprietà alla volta, puoi specificare i filtri che hai abilitato nella tua configurazione Firestore. Per farlo, passa semplicemente la configurazione degli indici alla tua collezione:

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

## Configurazione della collezione

Il `name` e le `properties` che definisci per la tua collezione di entità saranno usati per generare i campi nelle tabelle di collezione simili a fogli di calcolo e i campi nei form generati.

:::tip
Puoi forzare il CMS ad aprire sempre il form quando si modifica un documento impostando la proprietà `inlineEditing` su `false` nella configurazione della collezione.
:::

- **`name`**: Il nome plurale della collezione. Es., 'Products'.
- **`singularName`**: Il nome singolare di una voce nella collezione. Es., 'Product'.
- **`path`**: Percorso relativo Firestore di questa vista al suo genitore. Se questa vista è alla radice, il percorso è uguale a quello assoluto. Questo percorso determina anche l'URL in FireCMS.
- **`properties`**: Oggetto che definisce le proprietà per lo schema dell'entità. Ulteriori informazioni in [Proprietà](../properties/properties_intro).
- **`propertiesOrder`**: Ordine in cui le proprietà vengono visualizzate.
    - Per le proprietà, usa la chiave della proprietà.
    - Per i campi aggiuntivi, usa la chiave del campo.
    - Se hai sotto-collezioni, ottieni una colonna per ogni sotto-collezione, con il percorso (o alias) come sotto-collezione, preceduto da `subcollection:`. Es., `subcollection:orders`.
    - Se stai usando un gruppo di collezioni, avrai anche una colonna aggiuntiva `collectionGroupParent`.
    - Nota che se imposti questa prop, altri modi per nascondere i campi, come `hidden` nella definizione della proprietà, saranno ignorati. `propertiesOrder` ha la precedenza su `hidden`.

  ```typescript
  propertiesOrder: ["name", "price", "subcollection:orders"]
  ```

- **`openEntityMode`**: Determina come viene aperta la vista entità. Puoi scegliere tra `side_panel` (predefinito) o `full_screen`.
- **`formAutoSave`**: Se impostato su true, il form verrà salvato automaticamente quando l'utente cambia il valore di un campo. Impostazione predefinita false. Non puoi usare questa prop se stai usando un `customId`.
- **`collectionGroup`**: Se questa collezione è una voce di navigazione di primo livello, puoi impostare questa proprietà su `true` per indicare che questa collezione è un gruppo di collezioni.
- **`alias`**: Puoi impostare un alias che verrà usato internamente invece del `path`. Il valore `alias` verrà usato per determinare l'URL della collezione mentre `path` verrà ancora usato nel datasource. Nota che puoi usare questo valore anche nelle proprietà di riferimento.
- **`icon`**: Chiave icona da usare in questa collezione. Puoi usare qualsiasi delle icone nelle specifiche Material: [Material Icons](https://fonts.google.com/icons). Es., 'account_tree' o 'person'. Trova tutte le icone in [Icons](https://firecms.co/docs/icons). Puoi anche passare il tuo componente icona (`React.ReactNode`).
- **`customId`**: Se questa prop non è impostata, l'ID del documento sarà creato dal datasource. Puoi impostare il valore su 'true' per forzare gli utenti a scegliere l'ID.
- **`subcollections`**: Seguendo lo schema di documenti e collezioni Firestore, puoi aggiungere sotto-collezioni alla tua entità nello stesso modo in cui definisci le collezioni radice.
- **`defaultSize`**: Dimensione predefinita della collezione renderizzata.
- **`group`**: Campo opzionale usato per raggruppare le voci di navigazione di primo livello sotto una vista di navigazione. Se imposti questo valore in una sotto-collezione, non ha effetto.
- **`description`**: Descrizione opzionale di questa vista. Puoi usare Markdown.
- **`entityActions`**: Puoi definire azioni aggiuntive che possono essere eseguite sulle entità in questa collezione. Queste azioni possono essere visualizzate nella vista collezione o nella vista entità. Puoi usare il metodo `onClick` per implementare la tua logica. Nella prop `context`, puoi accedere a tutti i controller di FireCMS. Puoi anche definire azioni sulle entità globalmente. Vedi [Azioni Entità](./entity_actions) per ulteriori dettagli.

```tsx
const archiveEntityAction: EntityAction = {
    icon: <ArchiveIcon/>,
    name: "Archive",
    onClick({
                entity,
                collection,
                context
            }): Promise<void> {
        // Aggiungi il tuo codice qui
        return Promise.resolve(undefined);
    }
}
```

- **`initialFilter`**: Filtri iniziali applicati a questa collezione. Predefiniti a nessuno. I filtri applicati con questa prop possono essere cambiati dall'utente.

- **`forceFilter`**: Forza un filtro in questa vista. Se applicato, il resto dei filtri sarà disabilitato. I filtri applicati con questa prop non possono essere cambiati.

- **`initialSort`**: Ordinamento predefinito applicato a questa collezione. Accetta tuple nella forma `["property_name", "asc"]` o `["property_name", "desc"]`.

- **`Actions`**: Builder per il rendering di componenti aggiuntivi come pulsanti nella toolbar della collezione.
- **`pagination`**: Se abilitato, il contenuto viene caricato in batch. Se `false` tutte le entità nella collezione vengono caricate. Puoi specificare un numero per definire la dimensione della paginazione (50 per impostazione predefinita). Predefinito `true`.
- **`additionalFields`**: Puoi aggiungere campi aggiuntivi sia alla vista collezione che alla vista form implementando un delegato di campo aggiuntivo.
- **`textSearchEnabled`**: Flag per indicare se mostrare una barra di ricerca in cima alla tabella della collezione.
- **`permissions`**: Puoi specificare un oggetto con permessi booleani con la forma `{edit:boolean; create:boolean; delete:boolean}` per indicare le azioni che l'utente può eseguire. Puoi anche passare un [`PermissionsBuilder`](../api/type-aliases/PermissionsBuilder) per personalizzare i permessi in base all'utente o all'entità.
- **`inlineEditing`**: Gli elementi in questa collezione possono essere modificati inline nella vista collezione? Se questo flag è impostato su false ma `permissions.edit` è `true`, le entità possono comunque essere modificate nel pannello laterale.
- **`selectionEnabled`**: Le entità in questa collezione sono selezionabili? Predefinito `true`.
- **`exportable`**: I dati in questa vista collezione devono includere un pulsante di esportazione? Predefinito `true`.
- **`hideFromNavigation`**: Questa collezione deve essere nascosta dal pannello di navigazione principale se è al livello radice, o nel pannello laterale dell'entità se è una sotto-collezione?
- **`callbacks`**: Questa interfaccia definisce tutti i callback che possono essere usati quando un'entità viene creata, aggiornata o eliminata.
- **`entityViews`**: Array di builder per il rendering di pannelli aggiuntivi in una vista entità.
- **`alwaysApplyDefaultValues`**: Se impostato su true, i valori predefiniti delle proprietà verranno applicati all'entità ogni volta che viene aggiornata (non solo quando viene creata).
- **`databaseId`**: ID database opzionale di questa collezione. Se non specificato, verrà usato l'ID database predefinito.
- **`previewProperties`**: Proprietà di anteprima predefinite visualizzate quando questa collezione viene referenziata.
- **`titleProperty`**: Proprietà titolo dell'entità.
- **`defaultSelectedView`**: Se vuoi aprire viste personalizzate o sotto-collezioni per impostazione predefinita quando apri un'entità, specifica il percorso qui.
- **`hideIdFromForm`**: L'ID di questa collezione deve essere nascosto dalla vista form.
- **`hideIdFromCollection`**: L'ID di questa collezione deve essere nascosto dalla vista griglia.
- **`sideDialogWidth`**: Larghezza del dialogo laterale (in pixel o stringa) quando si apre un'entità in questa collezione.
- **`editable`**: La configurazione di questa collezione può essere modificata dall'utente finale. Predefinito `true`.
- **`includeJsonView`**: Se impostato su true, verrà inclusa una scheda con la rappresentazione JSON dell'entità.
- **`history`**: Se impostato su true, le modifiche all'entità verranno salvate in una sotto-collezione.
- **`localChangesBackup`**: Le modifiche locali devono essere salvate nel local storage per prevenire la perdita di dati. Opzioni: `"manual_apply"` (chiede di ripristinare), `"auto_apply"` (ripristina automaticamente), o `false`. Predefinito `"manual_apply"`.
- **`defaultViewMode`**: Modalità di visualizzazione predefinita per questa collezione. Opzioni: `"table"` (simile a foglio di calcolo, predefinita), `"cards"` (griglia di schede con miniature), `"kanban"` (bacheca raggruppata per proprietà).
- **`kanban`**: Configurazione per la modalità di visualizzazione Kanban. Richiede un `columnProperty` che fa riferimento a una proprietà enum.

```tsx
kanban: {
    columnProperty: "status" // Deve fare riferimento a una proprietà stringa con enumValues
}
```

- **`orderProperty`**: Chiave proprietà da usare per ordinare gli elementi. Deve fare riferimento a una proprietà numero. Usato dalla vista Kanban per l'ordinamento all'interno delle colonne.
