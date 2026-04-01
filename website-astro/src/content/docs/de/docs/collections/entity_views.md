---
title: Entity-Ansichten
slug: de/docs/collections/entity_views
sidebar_label: Entity-Ansichten
description: FireCMS ermöglicht es Ihnen, benutzerdefinierte Ansichten pro Entity hinzuzufügen. Erstellen Sie Vorschauen, Web-Seiten-Visualisierungen, Dashboards, Formularänderungen oder andere individuelle Ansichten in Ihrem CMS.
---

![Custom entity view](/img/entity_view.png)

FireCMS bietet Standard-Formular- und Tabellenfelder für häufige Anwendungsfälle und erlaubt auch das Überschreiben von Feldern, wenn Sie eine benutzerdefinierte Implementierung benötigen. In bestimmten Fällen möchten Sie jedoch eine vollständige **benutzerdefinierte Ansicht zu einer Entity** haben.

Typische Anwendungsfälle hierfür sind:

- **Vorschau** einer Entity in einem bestimmten Format.
- Überprüfung, wie die Daten auf einer **Webseite** aussehen.
- Definition eines **Dashboards**.
- Änderung des Zustands des **Formulars**.
- ... oder jede andere benutzerdefinierte Ansicht, die Sie benötigen.

Wenn Ihre Entity-Ansicht definiert ist, können Sie sie direkt zur Kollektion hinzufügen
oder sie in die Entity-Ansicht-Registry einbinden.

### Eine benutzerdefinierte Entity-Ansicht definieren

Dazu können Sie ein Array von `EntityCustomView` an Ihr Schema übergeben:

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
        // Dies ist eine benutzerdefinierte Komponente, die Sie als React-Komponente erstellen können
        <MyBlogPreviewComponent entity={entity}
                                modifiedValues={modifiedValues}/>
    )
};
```

Dann können Sie diese Ansicht zu einer Kollektion hinzufügen:

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    name: "Blog",
    path: "blog",
    entityViews: [sampleView],
    properties: {
        // ...
    }
});
```

### Entity-Ansicht-Registry

Sie können Entity-Ansichten in der Registry registrieren, um sie über verschiedene Kollektionen hinweg zugänglich zu machen:

#### FireCMS Cloud

```typescript
export const appConfig: FireCMSAppConfig = {
    version: "1",
    entityViews: [sampleView],
    collections: [
        // ...
    ]
};
```

#### FireCMS PRO

```tsx
<FireCMS
    entityViews={[sampleView]}
    // ...
/>
```

Dann können Sie in Ihren Kollektionen auf die registrierten Entity-Ansichten verweisen:

```typescript
const blogCollection = buildCollection({
    name: "Blog",
    path: "blog",
    entityViews: ["preview"], // ID der registrierten Ansicht
    properties: {
        // ...
    }
});
```
