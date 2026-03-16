---
slug: es/docs/hooks/use_auth_controller
title: useAuthController
sidebar_label: useAuthController
---

:::note
Ten en cuenta que para usar estos hooks **debes** estar en
un componente (no puedes usarlos directamente desde una función callback).
De todos modos, los callbacks generalmente incluyen un `FireCMSContext`, que incluye todos
los controladores.
:::

## `useAuthController`

Hook para acceder al estado de autenticación y realizar operaciones relacionadas con la autenticación.
Funciona con cualquier backend (Firebase, MongoDB o implementaciones personalizadas).

Las props proporcionadas por este hook son:

* `user` El objeto del usuario actualmente conectado, o `null` si no está autenticado
* `initialLoading` Flag de carga inicial, utilizado para evitar mostrar la pantalla de login antes de determinar el estado de autenticación
* `authLoading` Indica si el proceso de login/logout está en curso
* `signOut()` Cerrar la sesión del usuario actual
* `authError` Error durante la inicialización de la autenticación
* `authProviderError` Error despachado por el proveedor de autenticación
* `getAuthToken()` Obtener el token de autenticación del usuario actual (devuelve una Promise)
* `loginSkipped` Si el usuario ha omitido el proceso de login
* `extra` Datos adicionales almacenados en el auth controller (útil para roles, permisos, etc.)
* `setExtra(extra)` Establecer datos adicionales en el auth controller
* `setUser(user)` Establecer programáticamente el usuario actual (opcional, dependiente de la implementación)
* `setUserRoles(roles)` Establecer los roles del usuario (opcional, dependiente de la implementación)

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

