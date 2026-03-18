---
title: Ansichtsmodi für Kollektionen
slug: de/docs/collections/view_modes
sidebar_label: Ansichtsmodi
description: Erkunden Sie die drei Kollektionsansichten in FireCMS — Tabelle, Karten und Kanban. Erfahren Sie, wie Sie den Standard-Ansichtsmodus konfigurieren und Drag-and-Drop-Neusortierung in Kanban aktivieren.
---

FireCMS bietet drei Ansichtsmodi für Ihre Kollektionen: **Tabelle** (Standard), **Karten** und **Kanban**.
Benutzer können zwischen Ansichten wechseln — oder Sie können einen Standard vorgeben, der zu Ihrem Inhalt passt.

![Kollektionsansichtsmodi](/img/blog/kanban_settings.png)

## Verfügbare Ansichtsmodi

| Ansichtsmodus | Beschreibung | Am besten für |
|-----------|-------------|----------|
| **Tabelle** | Tabellenkalkulationsartiges Raster mit Inline-Bearbeitung | Dichte Daten, Massenoperationen, detaillierte Datensätze |
| **Karten** | Responsives Raster mit Thumbnails und Schlüsselfeldern | Visuelle Inhalte, Produktkataloge, Medienbibliotheken |
| **Kanban** | Board mit Spalten basierend auf einem Status-/Kategoriefeld | Workflows, Aufgabenmanagement, Bestellpipelines |

## Den Standard-Ansichtsmodus einstellen

Verwenden Sie die `defaultViewMode`-Eigenschaft in Ihrer Kollektionskonfiguration:

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

Benutzer können trotzdem zwischen Ansichten wechseln — `defaultViewMode` legt nur fest, was sie zuerst sehen.

---

## Verfügbare Ansichten einschränken

Standardmäßig sind alle drei Ansichtsmodi verfügbar. Verwenden Sie `enabledViews`, um einzuschränken, welche Ansichten angezeigt werden:

```typescript
const ordersCollection = buildCollection({
    path: "orders",
    name: "Orders",
    enabledViews: ["table", "kanban"], // Kartenansicht ist nicht verfügbar
    properties: {
        // ...
    }
});
```

:::note
Die Kanban-Ansicht ist automatisch verfügbar, wenn Ihre Kollektion mindestens eine String-Eigenschaft mit `enumValues` hat. Wenn keine Enum-Eigenschaften vorhanden sind, erscheint Kanban nicht im Selektor, auch wenn es in `enabledViews` enthalten ist.
:::

---

## Tabellenansicht

Der Standard-Ansichtsmodus. Zeigt Entities in einem tabellenkalkulationsartigen Raster mit Unterstützung für:
- Inline-Bearbeitung
- Sortieren und Filtern
- Spaltengrößenanpassung und -neuordnung
- Massenauswahl

**Am besten für:** Benutzerlisten, Transaktionsprotokolle, Analysedaten, jede Kollektion, bei der Sie viele Felder auf einmal sehen müssen.

---

## Kartenansicht

Verwandelt Ihre Kollektion in ein responsives Raster von Karten. Jede Karte zeigt:
- Bild-Thumbnails (automatisch aus Bild-Eigenschaften erkannt)
- Titel und Schlüsselmetadaten
- Schnellaktionen

![Kartenansicht Beispiel](/img/blog/cards_view_plants.png)

### Kartenansicht aktivieren

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

**Am besten für:** Produktkataloge, Blogbeiträge, Medienbibliotheken, Teamverzeichnisse, Portfolios — jede Kollektion mit Bildern.

---

## Kanban-Ansicht

Zeigt Entities als Karten an, die in Spalten basierend auf einer Enum-Eigenschaft organisiert sind. Ziehen und ablegen Sie Karten zwischen Spalten, um ihren Status zu aktualisieren.

![Kanban-Ansicht in Aktion](/img/blog/kanban_view.png)

### Automatische Erkennung

Die Kanban-Ansicht ist **automatisch verfügbar** für jede Kollektion, die mindestens eine String-Eigenschaft mit definierten `enumValues` hat. Keine zusätzliche Konfiguration erforderlich.

### Eine Standard-Spalteneigenschaft festlegen

Wenn Ihre Kollektion mehrere Enum-Eigenschaften hat, können Sie mit der `kanban`-Konfiguration festlegen, welche standardmäßig für Spalten verwendet wird.

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: {
        columnProperty: "status" // Optional: wählt vor, nach welchem Enum gruppiert wird
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

### Drag-and-Drop-Neuordnung

Um die Neuordnung von Karten innerhalb einer Spalte zu aktivieren, fügen Sie eine `orderProperty` hinzu:

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: { columnProperty: "status" },
    orderProperty: "order", // Muss auf eine Zahleneigenschaft verweisen
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

:::caution[Firestore-Index erforderlich]
Bei Verwendung der Kanban-Ansicht mit Firestore benötigen Sie einen zusammengesetzten Index auf Ihrer Spalteneigenschaft. Firestore zeigt Ihnen beim ersten Laden der Ansicht den genauen Index-Link an.
:::

**Am besten für:** Aufgabenmanagement, Auftragserfüllung, Content-Pipelines, Support-Tickets, Einstellungsworkflows.

---

## Konfiguration in FireCMS Cloud

Wenn Sie FireCMS Cloud verwenden, können Sie Ansichtsmodi über die UI konfigurieren:

1. Öffnen Sie Ihre Kollektionseinstellungen
2. Gehen Sie zur Registerkarte **Anzeige**
3. Wählen Sie Ihre **Standard-Kollektionsansicht** (Tabelle, Karten oder Kanban)
4. Für Kanban wählen Sie die **Kanban-Spalteneigenschaft** und optional eine **Ordnungseigenschaft**

![Kanban-Einstellungen in FireCMS Cloud](/img/blog/kanban_settings.png)
