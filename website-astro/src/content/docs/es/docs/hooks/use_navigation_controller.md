---
slug: es/docs/hooks/use_navigation_controller
title: useNavigationController
sidebar_label: useNavigationController
description: Acceda al controlador de navegación de FireCMS para obtener colecciones, resolver rutas y realizar navegación.
---

Use este hook para acceder al controlador de navegación de la aplicación. Este controlador sirve como punto central para:
*   Acceder a la configuración resuelta de colecciones y vistas.
*   Resolver rutas e IDs (por ejemplo, convertir una ruta URL a una ruta de base de datos).
*   Navegación programática.

### Uso

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function NavigationExample() {
    const navigationController = useNavigationController();

    const goToProducts = () => {
        // Navegar a la colección de productos
        // Esto maneja el enrutamiento correcto internamente
        navigationController.navigate("/c/products");
    };
    
    // También puede recuperar colecciones por su ID
    const productsCollection = navigationController.getCollection("products");

    return (
        <div>
            <p>Nombre de la colección de productos: {productsCollection?.name}</p>
            <Button onClick={goToProducts}>Ir a Productos</Button>
        </div>
    );
}
```

### Métodos y propiedades clave

*   **`collections`**: Lista de todas las colecciones de entidades resueltas.
*   **`views`**: Lista de vistas personalizadas de nivel superior.
*   **`getCollection(pathOrId, includeUserOverride?)`**: Obtener una colección por su `id` o `path`.
*   **`navigate(to, options?)`**: Navegar a una ruta específica.
*   **`refreshNavigation()`**: Forzar un recálculo de la estructura de navegación (útil si sus colecciones son dinámicas).
*   **`urlPathToDataPath(cmsPath)`**: Convertir una URL del CMS a una ruta de la fuente de datos.
    *   Ejemplo: `/c/products/B34SAP8Z` -> `products/B34SAP8Z`
*   **`buildUrlCollectionPath(path)`**: Convertir una ruta de la fuente de datos a una URL del CMS.
    *   Ejemplo: `products` -> `/c/products`
*   **`resolveIdsFrom(pathWithAliases)`**: Resolver alias en una ruta a sus IDs reales.

### Interfaz NavigationController

```tsx
export type NavigationController = {
    collections?: EntityCollection[];
    views?: CMSView[];
    loading: boolean;
    initialised: boolean;
    
    getCollection: (pathOrId: string, includeUserOverride?: boolean) => EntityCollection | undefined;
    getCollectionById: (id: string) => EntityCollection | undefined;
    
    navigate: (to: string, options?: NavigateOptions) => void;
    refreshNavigation: () => void;
    
    // ... métodos utilitarios para resolución de rutas
}
```
