---
title: useNavigationController
sidebar_label: useNavigationController
description: Accede al controlador de navegación de FireCMS para obtener colecciones, resolver rutas y navegar programáticamente.
---

Usa este hook para acceder al controlador de navegación de la aplicación. Este controlador sirve como punto central para:
*   Acceder a la configuración resuelta de colecciones y vistas.
*   Resolver rutas e IDs (p.ej. convertir una ruta URL en una ruta de base de datos).
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
    
    // También puedes recuperar colecciones por su ID
    const productsCollection = navigationController.getCollection("products");

    return (
        <div>
            <p>Nombre de la colección de productos: {productsCollection?.name}</p>
            <Button onClick={goToProducts}>Ir a Productos</Button>
        </div>
    );
}
```

### Métodos y Propiedades Principales

*   **`collections`**: Lista de todas las colecciones de entidades resueltas.
*   **`views`**: Lista de vistas personalizadas de nivel superior.
*   **`getCollection(pathOrId, includeUserOverride?)`**: Obtiene una colección por su `id` o `path`.
*   **`navigate(to, options?)`**: Navega a una ruta específica.
*   **`refreshNavigation()`**: Fuerza un recálculo de la estructura de navegación (útil si tus colecciones son dinámicas).
*   **`urlPathToDataPath(cmsPath)`**: Convierte una URL del CMS a una ruta de la fuente de datos.
    *   Ejemplo: `/c/products/B34SAP8Z` -> `products/B34SAP8Z`
*   **`buildUrlCollectionPath(path)`**: Convierte una ruta de la fuente de datos en una URL del CMS.
    *   Ejemplo: `products` -> `/c/products`
*   **`resolveIdsFrom(pathWithAliases)`**: Resuelve alias en una ruta a sus IDs reales.

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
    
    // ... métodos de utilidad para resolución de rutas
}
```
