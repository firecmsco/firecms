---
slug: it/docs/collections/view_modes
title: Modalità di visualizzazione collezione
sidebar_label: Modalità di visualizzazione
description: Visualizza le tue collezioni come Tabelle, Schede o bacheche Kanban in FireCMS.
---

FireCMS offre tre diversi modi di visualizzare le tue collezioni. Ogni modalità è ottimizzata per diversi tipi di dati e flussi di lavoro.

![Collection View Modes](/img/blog/kanban_settings.png)

## Modalità di visualizzazione disponibili

| Modalità | Descrizione | Ideale per |
|-----------|-------------|----------|
| **Tabella** | Griglia simile a foglio di calcolo con modifica inline | Dati densi, operazioni in blocco, record dettagliati |
| **Schede** | Griglia responsiva con miniature e campi chiave | Contenuto visivo, cataloghi prodotti, librerie media |
| **Kanban** | Bacheca con colonne basata su un campo stato/categoria | Flussi di lavoro, gestione attività, pipeline ordini |

## Impostare la vista predefinita

Usa la proprietà `defaultViewMode` nella configurazione della tua collezione:

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

Gli utenti possono comunque passare tra le viste usando il selettore nella toolbar della collezione — `defaultViewMode` imposta solo cosa vedono per primo.

---

## Limitare le viste disponibili

Per impostazione predefinita, tutte e tre le modalità sono disponibili. Usa `enabledViews` per limitare quali viste appaiono nel selettore:

```typescript
const ordersCollection = buildCollection({
    path: "orders",
    name: "Orders",
    enabledViews: ["table", "kanban"], // La vista Schede non sarà disponibile
    properties: {
        // ...
    }
});
```

:::note
La vista Kanban è automaticamente disponibile per qualsiasi collezione che ha almeno una proprietà stringa con `enumValues`. Se non esistono proprietà enum, Kanban non apparirà nel selettore.
:::

---

## Vista Tabella

La modalità di visualizzazione predefinita. Mostra le entità in una griglia simile a un foglio di calcolo con supporto per:
- Modifica inline
- Ordinamento e filtraggio
- Ridimensionamento e riordino delle colonne
- Selezione in blocco

**Ideale per:** Liste utenti, log transazioni, dati analitici, qualsiasi collezione dove hai bisogno di vedere molti campi contemporaneamente.

---

## Vista Schede

Trasforma la tua collezione in una griglia responsiva di schede. Ogni scheda mostra:
- Miniature immagine (rilevate automaticamente dalle proprietà immagine)
- Titolo e metadati chiave
- Azioni rapide

![Cards View Example](/img/blog/cards_view_plants.png)

### Abilitare la vista Schede

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

**Ideale per:** Cataloghi prodotti, post blog, librerie media, directory team, portfolio — qualsiasi collezione con immagini.

---

## Vista Kanban

Mostra le entità come schede organizzate in colonne basate su una proprietà enum. Trascina le schede tra le colonne per aggiornarne lo stato.

![Kanban View in Action](/img/blog/kanban_view.png)

### Rilevamento automatico

La vista Kanban è **automaticamente disponibile** per qualsiasi collezione che ha almeno una proprietà stringa con `enumValues`. Nessuna configurazione aggiuntiva richiesta.

### Impostare una proprietà colonna predefinita

Quando la tua collezione ha più proprietà enum, puoi impostare quale viene usata per le colonne per impostazione predefinita con la config `kanban`.

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: {
        columnProperty: "status" // Opzionale: pre-seleziona quale enum usare per raggruppare
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

### Riordino tramite trascinamento

Per abilitare il riordino delle schede all'interno di una colonna, aggiungi un `orderProperty`:

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: { columnProperty: "status" },
    orderProperty: "order", // Deve fare riferimento a una proprietà numero
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

:::caution[Indice Firestore richiesto]
Quando si usa la vista Kanban con Firestore, avrai bisogno di un indice composito sulla tua proprietà colonna. Firestore ti chiederà il link esatto dell'indice quando carichi la vista per la prima volta.
:::

**Ideale per:** Gestione attività, evasione ordini, pipeline contenuti, ticket supporto, flussi di lavoro assunzioni — qualsiasi collezione con fasi distinte.

---

## Configurazione in FireCMS Cloud

Se stai usando FireCMS Cloud, puoi configurare le modalità di visualizzazione tramite l'UI senza scrivere codice:

1. Apri le impostazioni della tua collezione
2. Vai alla scheda **Display**
3. Seleziona la tua **Vista collezione predefinita** (Tabella, Schede o Kanban)
4. Per Kanban, scegli la **Proprietà colonna Kanban** e opzionalmente una **Proprietà ordine**

![Kanban Settings in FireCMS Cloud](/img/blog/kanban_settings.png)
