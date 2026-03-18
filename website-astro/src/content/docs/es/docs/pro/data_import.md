---
title: Importación de Datos
slug: es/docs/pro/data_import
---

![data_import.png](/img/data_import.png)

El **Plugin de Importación de Datos** para FireCMS te permite importar datos de colecciones desde archivos JSON, CSV o XLSX (Excel) directamente en tu aplicación FireCMS. Este plugin proporciona una interfaz donde los usuarios pueden subir archivos y mapear los datos existentes a las propiedades de la colección. Esto facilita enormemente mover datos de un servicio a otro y convertir datos al tipo de datos correcto en la base de datos.

El plugin es capaz de realizar conversiones automáticas de algunos tipos de datos, como fechas.

La función de importación también puede utilizarse dentro del plugin del editor de colecciones. En el editor de colecciones, puedes crear nuevas colecciones a partir de un archivo de datos. Será capaz de entender correctamente la estructura de tus datos, e incluso inferir tipos como fechas o enumeraciones (aunque estén almacenadas como cadenas de texto).

## Instalación

Primero, instala el paquete del Plugin de Importación de Datos:

```sh
yarn add @firecms/data_import
```

## Configuración

Integra el Plugin de Importación de Datos usando el hook `useImportPlugin`. Opcionalmente puedes proporcionar `ImportPluginProps` para personalizar su comportamiento.

### ImportPluginProps

- **`onAnalyticsEvent`**: Callback que se activa en eventos de analítica relacionados con la importación.
    - **Tipo**: `(event: string, params?: any) => void`
    - **Por defecto**: `undefined`

## Uso del Hook

Usa el hook `useImportPlugin` para crear el plugin de importación e inclúyelo en la configuración de FireCMS.

### Ejemplo: Integración del Plugin de Importación de Datos

```jsx
import React from "react";
import { CircularProgressCenter, FireCMS, useBuildModeController } from "@firecms/core";
import { useFirebaseStorageSource } from "@firecms/firebase";
import { useImportPlugin } from "@firecms/data_import";

export function App() {

    const importPlugin = useImportPlugin({
        onAnalyticsEvent: (event, params) => {
            console.log(`Evento de importación: ${event}`, params);
            // Integra con tu servicio de analítica si lo necesitas
        },
    });


    return (
            <FireCMS
                navigationController={navigationController}
                /*... resto de tu configuración */
            >
              {({ context, loading }) => {
                  // ... tus componentes
              }}
            </FireCMS>
    );
}

export default App;
```

## Uso de la Funcionalidad de Importación

Tras la integración, la función de importación está disponible en las vistas de colecciones. Los usuarios pueden subir archivos JSON o CSV para poblar las colecciones.

### Pasos para Importar Datos

1. **Navega a una Colección**: Abre la colección deseada en tu aplicación FireCMS.
2. **Iniciar Importación**: Haz clic en la acción **Importar** en la barra de herramientas de acciones de la colección.
3. **Subir Archivo**: Selecciona y sube el archivo JSON o CSV que contiene los datos.
4. **Mapeo de Tipos de Datos**: Selecciona los tipos de datos y cómo deben mapearse a la estructura actual.
4. **Procesamiento de Datos**: El plugin procesa el archivo y añade los datos a tu colección.

## Tipos

### `ImportPluginProps`

Define las propiedades para el hook `useImportPlugin`.

```typescript
export type ImportPluginProps = {
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
```

### `ImportAllowedParams`

Proporciona contexto para determinar los permisos de importación.

```typescript
export type ImportAllowedParams = { 
    collectionEntitiesCount: number; 
    path: string; 
    collection: EntityCollection; 
};
```

## Ejemplo: Seguimiento de Importaciones con Google Analytics

```jsx
const importPlugin = useImportPlugin({
    onAnalyticsEvent: (event, params) => {
        if (window && window.gtag) {
            window.gtag('event', event, params);
        }
    },
});
```

