---
slug: es/docs/hooks/use_auth_controller
title: useAuthController
sidebar_label: useAuthController
---

:::note
Tenga en cuenta que para usar estos hooks **debe** estar en
un componente (no puede usarlos directamente desde una función callback).
De todas formas, los callbacks generalmente incluyen un `FireCMSContext`, que contiene todos
los controladores.
:::

## `useAuthController`

Hook para acceder al estado de autenticación y realizar operaciones relacionadas con la autenticación.
Funciona con cualquier backend (Firebase, MongoDB o implementaciones personalizadas).

Las propiedades proporcionadas por este hook son:

* `user` El objeto del usuario actualmente autenticado, o `null` si no está autenticado
* `initialLoading` Indicador de carga inicial, utilizado para evitar mostrar la pantalla de inicio de sesión antes de que se determine el estado de autenticación
* `authLoading` Indica si el proceso de inicio/cierre de sesión está en curso
* `signOut()` Cerrar la sesión del usuario actual
* `authError` Error durante la inicialización de la autenticación
* `authProviderError` Error emitido por el proveedor de autenticación
* `getAuthToken()` Obtener el token de autenticación del usuario actual (devuelve una Promise)
* `loginSkipped` Indica si el usuario omitió el proceso de inicio de sesión
* `extra` Datos adicionales almacenados en el controlador de autenticación (útil para roles, permisos, etc.)
* `setExtra(extra)` Establecer datos adicionales en el controlador de autenticación
* `setUser(user)` Establecer programáticamente el usuario actual (opcional, depende de la implementación)
* `setUserRoles(roles)` Establecer los roles del usuario (opcional, depende de la implementación)

Ejemplo:

```tsx
import React from "react";
import { useAuthController } from "@firecms/core";

export function ExampleCMSView() {

    const authController = useAuthController();

    if (authController.authLoading) {
        return <div>Loading...</div>;
    }

    return (
        authController.user ?
            <div>Logged in as {authController.user.displayName}</div>
            :
            <div>You are not logged in</div>
    );
}
```
