---
slug: es/docs/pro/data_export
title: Exportación de Datos
description: Exporta tus colecciones de Firestore a JSON o CSV con el plugin de Exportación de Datos de FireCMS. Ideal para copias de seguridad, migraciones y análisis de datos.
---

![data_export.png](/img/data_export.png)

Exporta tus datos de **Firestore** directamente desde tu **panel de administración**. El Plugin de Exportación de Datos añade exportación con un solo clic a JSON y CSV en cualquier colección de FireCMS.

:::tip[Casos de uso comunes]
- **Copias de seguridad**: Crea instantáneas periódicas de tus datos
- **Migraciones**: Mueve datos entre entornos o bases de datos
- **Informes**: Alimenta datos en hojas de cálculo o herramientas de BI
- **Cumplimiento normativo**: Exporta datos para auditorías o solicitudes RGPD
:::

## Instalación

Primero, asegúrate de haber instalado las dependencias necesarias. Para usar el plugin, necesitas tener FireCMS configurado en tu proyecto.

```sh
yarn add @firecms/data_export
```

o

```sh
npm install @firecms/data_export
```

## Configuración

El plugin requiere una configuración mínima y puede integrarse fácilmente en tu configuración de FireCMS. Puedes personalizar el comportamiento de exportación usando `ExportPluginProps`.

### Parámetros de ExportPluginProps

A continuación se muestran los parámetros que puedes configurar:

- **`exportAllowed`**: Función que determina si se permite la exportación según los parámetros proporcionados.
    - **Tipo**: `(props: ExportAllowedParams) => boolean`
    - **Por defecto**: `undefined` (la exportación está permitida por defecto)
- **`notAllowedView`**: Nodo React que se muestra cuando no se permite la exportación.
    - **Tipo**: `React.ReactNode`
    - **Por defecto**: `undefined`
- **`onAnalyticsEvent`**: Función de callback que se activa en eventos de analítica relacionados con la exportación.
    - **Tipo**: `(event: string, params?: any) => void`
    - **Por defecto**: `undefined`

### ExportAllowedParams

El tipo `ExportAllowedParams` proporciona contexto para la función `exportAllowed`:

- **`collectionEntitiesCount`**: El número de entidades en la colección.
    - **Tipo**: `number`
- **`path`**: La ruta de la colección en FireCMS.
    - **Tipo**: `string`
- **`collection`**: La entidad de colección.
    - **Tipo**: `EntityCollection`

## Uso del Hook

El hook principal para utilizar la funcionalidad del plugin es `useExportPlugin`. A continuación se muestra un ejemplo de cómo usarlo:

```jsx
import React from "react";
import { FireCMS } from "@firecms/core";
import { useExportPlugin } from "@firecms/data_export";

function App() {
    
    const exportPlugin = useExportPlugin({
        exportAllowed: ({
                            collectionEntitiesCount,
                            path,
                            collection
                        }) => {
            // Ejemplo: Permitir exportación solo si hay más de 10 entidades
            return collectionEntitiesCount > 10;
        },
        notAllowedView: <div>La exportación no está permitida.</div>,
        onAnalyticsEvent: (event, params) => {
            console.log(`Evento de exportación: ${event}`, params);
        },
    });

    const plugins = [exportPlugin];

    const navigationController = useBuildNavigationController({
        // ... resto de tu configuración
        plugins
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

## Configuración del Plugin

Para integrar el Plugin de Exportación de Datos en FireCMS, usa el hook `useExportPlugin` y pasa el plugin resultante a la configuración de FireCMS. Normalmente querrás hacer esto en tu componente principal App.

## Uso de la Funcionalidad de Exportación

Una vez integrado el plugin, puedes usar la funcionalidad de exportación directamente en las vistas de colecciones. El plugin añade acciones de exportación a las vistas de colecciones, permitiendo a los usuarios exportar datos como JSON o CSV.

### Ejemplo: Exportar una Colección

1. Navega a la colección deseada en tu aplicación FireCMS.
2. Haz clic en la acción **Exportar** en la barra de herramientas de acciones de la colección.
3. Elige el formato de exportación deseado (JSON o CSV).
4. El archivo exportado se descargará en tu dispositivo.

## Personalizar el Comportamiento de Exportación

Puedes personalizar cómo funciona la exportación proporcionando implementaciones personalizadas para las props `exportAllowed`, `notAllowedView` y `onAnalyticsEvent`.

### Ejemplo: Restringir la Exportación Según el Rol del Usuario

```jsx
const exportPlugin = useExportPlugin({
    exportAllowed: ({
                        collection,
                        path,
                        collectionEntitiesCount
                    }) => {
        // Permitir exportación solo para administradores
        return userRoles.includes('admin');
    },
    notAllowedView: <div>Solo los administradores pueden exportar datos.</div>,
    onAnalyticsEvent: (event, params) => {
        // Registrar eventos de exportación para auditoría
        logAnalytics(event, params);
    },
});
```

## Tipos

### `ExportPluginProps`

Define las propiedades que se pueden pasar al hook `useExportPlugin`.

```typescript
export type ExportPluginProps = {
    exportAllowed?: (props: ExportAllowedParams) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
```

### `ExportAllowedParams`

Proporciona contexto para determinar si se permite la exportación.

```typescript
export type ExportAllowedParams = {
    collectionEntitiesCount: number;
    path: string;
    collection: EntityCollection;
};
```

