---
slug: es/docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Obtiene el contexto que incluye los controladores internos y contextos utilizados por la aplicación.
Algunos controladores y contextos incluidos en este contexto pueden ser accedidos
directamente desde sus respectivos hooks.

Las propiedades proporcionadas por este hook son:

* `dataSource`: Conector a su base de datos, por ejemplo, su base de datos Firestore

* `storageSource`: Implementación de almacenamiento utilizada

* `navigation`: Contexto que incluye la navegación resuelta y métodos y
  atributos utilitarios.

* `sideEntityController`: Controlador para abrir el diálogo lateral que muestra formularios de entidad

* `sideDialogsController`: Controlador utilizado para abrir diálogos laterales (utilizado internamente por
  los diálogos laterales de entidad o diálogos de referencia)

* `dialogsController`: Controlador utilizado para abrir diálogos regulares

* `authController`: Controlador de autenticación utilizado

* `customizationController`: Controlador que contiene las opciones de personalización del CMS

* `snackbarController`: Use este controlador para mostrar snackbars

* `userConfigPersistence`: Use este controlador para acceder a datos almacenados en el navegador del usuario

* `analyticsController`: Callback para enviar eventos de analíticas (opcional)

* `userManagement`: Sección utilizada para gestionar usuarios en el CMS. Se usa para mostrar información del usuario
  en varios lugares y asignar la propiedad de las entidades.

Ejemplo:

```tsx
import React from "react";
import { useFireCMSContext } from "@firecms/core";

export function ExampleCMSView() {

    const context = useFireCMSContext();

    // Acceder a la fuente de datos
    const dataSource = context.dataSource;

    // Abrir un snackbar
    context.snackbarController.open({
        type: "success",
        message: "Mensaje de ejemplo"
    });

    return <div>Vista de ejemplo</div>;
}
```
