---
slug: de/docs/pro/collection_editor
title: Collection Editor UI
---

![collection_editor.png](/img/collection_editor.png)

Dieses Dokument beschreibt, wie das **Collection Editor UI Plugin** mit **FireCMS** zur Verwaltung und Konfiguration Ihrer Firestore-Kollektionen verwendet wird.

Typischerweise werden Kollektionen in FireCMS im Code definiert und als Prop an den `NavigationController` übergeben. Das Collection Editor UI Plugin ermöglicht es Ihnen, Kollektionen direkt in der Anwendung zu verwalten.

## Installation

```sh
yarn add @firecms/collection_editor
```

oder

```sh
npm install @firecms/collection_editor
```

## Verwendung

```tsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";
import { useCollectionEditorFirestorePlugin } from "@firecms/collection_editor_firebase";

function App() {
    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionEditorFirestoreDelegate: useCollectionEditorFirestorePlugin()
    });

    return (
        <FireCMSApp
            // ...
            plugins={[collectionEditorPlugin]}
        />
    );
}
```

## Funktionen

- **Kollektionen erstellen und bearbeiten**: Erstellen Sie neue Kollektionen oder bearbeiten Sie vorhandene direkt in der UI.
- **Kollektionsschema verwalten**: Felder (Eigenschaften) hinzufügen, bearbeiten oder entfernen.
- **Benutzerberechtigungen**: Steuern Sie, wer Kollektionen bearbeiten darf.
- **Code exportieren**: Exportieren Sie Kollektionen als Code für Versionskontrolle.
