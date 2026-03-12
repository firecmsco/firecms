---
slug: es/docs/hooks/use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
description: Accede a la fuente de almacenamiento de FireCMS para subir archivos y obtener URLs de descarga. Compatible con Firebase Storage o cualquier implementación de almacenamiento personalizada.
---

Usa este hook para acceder a la fuente de almacenamiento utilizada en tu aplicación FireCMS.

Cada archivo subido en FireCMS se referencia por una cadena con el formato
`${path}/${fileName}`, que luego se referencia en la fuente de datos como un valor
de tipo string en propiedades que tienen una configuración de almacenamiento.

Puedes usar este controlador para subir archivos y obtener la ruta de almacenamiento donde
fue guardado. Luego puedes convertir esa `storagePath` en una URL de descarga.

:::note
Ten en cuenta que para usar este hook **debes** estar en
un componente (no puedes usarlo directamente en una función de callback).
:::

### Métodos Disponibles

* `uploadFile`: Sube un archivo, especificando el archivo, nombre y ruta
* `getDownloadURL`: Convierte una ruta de almacenamiento en una URL de descarga

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
