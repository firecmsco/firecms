---
slug: pt/docs/hooks/use_auth_controller
title: useAuthController
sidebar_label: useAuthController
---

:::note
Observe que para usar esses hooks você **deve** estar dentro
de um componente (não é possível usá-los diretamente em uma função callback).
No entanto, os callbacks geralmente incluem um `FireCMSContext`, que contém todos
os controladores.
:::

## `useAuthController`

Hook para acessar o estado de autenticação e realizar operações relacionadas à autenticação.
Funciona com qualquer backend (Firebase, MongoDB ou implementações personalizadas).

As propriedades fornecidas por este hook são:

* `user` O objeto do usuário atualmente autenticado, ou `null` se não estiver autenticado
* `initialLoading` Flag de carregamento inicial, utilizado para evitar exibir a tela de login antes que o estado de autenticação seja determinado
* `authLoading` Indica se o processo de login/logout está em andamento
* `signOut()` Desconectar o usuário atual
* `authError` Erro durante a inicialização da autenticação
* `authProviderError` Erro emitido pelo provedor de autenticação
* `getAuthToken()` Obter o token de autenticação do usuário atual (retorna uma Promise)
* `loginSkipped` Indica se o usuário pulou o processo de login
* `extra` Dados adicionais armazenados no controlador de autenticação (útil para papéis, permissões, etc.)
* `setExtra(extra)` Definir dados adicionais no controlador de autenticação
* `setUser(user)` Definir o usuário atual programaticamente (opcional, depende da implementação)
* `setUserRoles(roles)` Definir os papéis do usuário (opcional, depende da implementação)

Exemplo:

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
