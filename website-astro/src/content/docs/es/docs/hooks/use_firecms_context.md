---
slug: es/docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Obtén el contexto que incluye los controladores internos y contextos utilizados por la aplicación.
Algunos controladores y contextos incluidos en este contexto pueden ser accedidos
directamente desde sus respectivos hooks.

Las props proporcionadas por este hook son:

* `dataSource`: Conector a tu base de datos, por ejemplo tu base de datos Firestore

* `storageSource`: Implementación de almacenamiento utilizada

* `navigation`: Contexto que incluye la navegación resuelta y métodos y
  atributos utilitarios.

* `sideEntityController`: Controlador para abrir el diálogo lateral que muestra formularios de entidad

* `sideDialogsController`: Controlador utilizado para abrir diálogos laterales (usado internamente por
  los diálogos laterales de entidad o diálogos de referencia)

* `dialogsController`: Controlador utilizado para abrir diálogos regulares

* `authController`: Controlador de autenticación utilizado

* `customizationController`: Controlador que contiene las opciones de personalización del CMS

* `snackbarController`: Usa este controlador para mostrar snackbars

* `userConfigPersistence`: Usa este controlador para acceder a datos almacenados en el navegador para el usuario

* `analyticsController`: Callback para enviar eventos de analítica (opcional)

* `userManagement`: Sección utilizada para gestionar usuarios en el CMS. Se usa para mostrar información del usuario
  en varios lugares y asignar propiedad de entidades.

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
