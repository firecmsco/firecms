---
title: useAnalyticsController
sidebar_label: useAnalyticsController
description: Hook para acceder al controlador de analítica y escuchar eventos del CMS.
---

Hook para acceder al controlador de analítica. Este controlador te permite escuchar eventos internos del CMS, como navegación, creación de entidades, edición, etc.

Puedes usarlo para integrarte con proveedores de analítica de terceros como Google Analytics, Mixpanel o Segment.

### Uso

```tsx
import { useAnalyticsController } from "@firecms/core";
import { useEffect } from "react";

export function MyAnalyticsComponent() {
    const analyticsController = useAnalyticsController();

    useEffect(() => {
        // Normalmente configurarías esto en el punto de entrada principal de tu app
        // Esto es solo para demostración
        console.log("Controlador de analítica disponible");
    }, [analyticsController]);

    return null;
}
```

### Interfaz

```tsx
export type AnalyticsController = {
    /**
     * Callback usado para recibir eventos de analítica del CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
}
```

### Eventos

El tipo `CMSAnalyticsEvent` define todos los eventos posibles:

* `entity_click`: El usuario hizo clic en una entidad en una colección
* `edit_entity_clicked`: El usuario hizo clic en el botón de editar
* `new_entity_click`: El usuario hizo clic en el botón "Nuevo"
* `new_entity_saved`: Se creó con éxito una nueva entidad
* `entity_edited`: Se actualizó una entidad
* `entity_deleted`: Se eliminó una entidad
* `drawer_navigate_to_collection`: El usuario navegó a una colección desde el cajón de navegación
* `home_navigate_to_collection`: El usuario navegó a una colección desde la página de inicio
* ... y más.
