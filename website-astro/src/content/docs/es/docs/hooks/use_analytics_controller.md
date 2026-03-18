---
slug: es/docs/hooks/use_analytics_controller
title: useAnalyticsController
sidebar_label: useAnalyticsController
description: Hook para acceder al controlador de analíticas y escuchar eventos del CMS.
---

Hook para acceder al controlador de analíticas. Este controlador le permite escuchar eventos internos del CMS, como navegación, creación de entidades, edición, etc.

Puede usarlo para integrarse con proveedores de analíticas de terceros como Google Analytics, Mixpanel o Segment.

### Uso

```tsx
import { useAnalyticsController } from "@firecms/core";
import { useEffect } from "react";

export function MyAnalyticsComponent() {
    const analyticsController = useAnalyticsController();

    useEffect(() => {
        // Normalmente configuraría esto en el punto de entrada principal de su aplicación
        // Esto es solo para demostración
        console.log("Analytics controller available");
    }, [analyticsController]);

    return null;
}
```

### Interfaz

```tsx
export type AnalyticsController = {
    /**
     * Callback utilizado para obtener eventos de analíticas del CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
}
```

### Eventos

El tipo `CMSAnalyticsEvent` define todos los eventos posibles:

* `entity_click`: El usuario hizo clic en una entidad de una colección
* `edit_entity_clicked`: El usuario hizo clic en el botón de editar
* `new_entity_click`: El usuario hizo clic en el botón "Nuevo"
* `new_entity_saved`: Una nueva entidad fue creada exitosamente
* `entity_edited`: Una entidad fue actualizada
* `entity_deleted`: Una entidad fue eliminada
* `drawer_navigate_to_collection`: El usuario navegó a una colección desde el cajón lateral
* `home_navigate_to_collection`: El usuario navegó a una colección desde la página de inicio
* ... y más.
