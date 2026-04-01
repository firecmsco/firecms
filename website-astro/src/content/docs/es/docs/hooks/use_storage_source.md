---
slug: es/docs/hooks/use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
description: Acceda a la fuente de almacenamiento de FireCMS para subir archivos y obtener URLs de descarga. Funciona con Firebase Storage o cualquier implementación de almacenamiento personalizada.
---

Use este hook para acceder a la fuente de almacenamiento utilizada en su aplicación FireCMS.

Cada archivo subido en FireCMS es referenciado por una cadena en la forma
`${path}/${fileName}`, que luego es referenciada en la fuente de datos como un valor
de cadena en propiedades que tienen una configuración de almacenamiento.

Puede usar este controlador para subir archivos y obtener la ruta de almacenamiento donde fue
guardado. Luego puede convertir esa ruta de almacenamiento en una URL de descarga.

:::note
Tenga en cuenta que para usar este hook **debe** estar en
un componente (no puede usarlo directamente desde una función callback).
:::

### Métodos disponibles

* `uploadFile`: Subir un archivo, especificando el archivo, nombre y ruta
* `getDownloadURL`: Convertir una ruta de almacenamiento en una URL de descarga

### Ejemplo

```tsx
import React from "react";
import { useStorageSource } from "@firecms/core";
import { Button } from "@firecms/ui";

export function FileUploader() {
    const storageSource = useStorageSource();

    const handleUpload = async (file: File) => {
        const result = await storageSource.uploadFile({
            file,
            fileName: file.name,
            path: "uploads",
        });
        console.log("Archivo subido a:", result.path);
    };

    return (
        <input
            type="file"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                    handleUpload(e.target.files[0]);
                }
            }}
        />
    );
}
```
