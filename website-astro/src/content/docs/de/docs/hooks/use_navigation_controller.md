---
title: useNavigationController
sidebar_label: useNavigationController
description: Zugriff auf den FireCMS-Navigationscontroller für Kollektionen, Pfadauflösung und Navigation.
---

Verwenden Sie diesen Hook für den Zugriff auf den Navigationscontroller der App. Dieser Controller dient als zentraler Punkt für:
*   Zugriff auf die aufgelöste Konfiguration von Kollektionen und Ansichten.
*   Pfade und IDs auflösen (z.B. Konvertierung eines URL-Pfads in einen Datenbankpfad).
*   Programmgesteuerte Navigation.

### Verwendung

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function NavigationExample() {

    const navigationController = useNavigationController();

    return (
        <Button
            onClick={() => navigationController.navigate("/products")}>
            Zu Produkten navigieren
        </Button>
    );
}
```
