---
slug: pt/docs/hooks/use_auth_controller
title: useAuthController
sidebar_label: useAuthController
---

:::note
Para usar esses hooks você **deve** estar dentro de um componente (não é possível usá-los diretamente de uma função callback).
De qualquer forma, os callbacks geralmente incluem um `FireCMSContext`, que inclui todos os controllers.
:::

## `useAuthController`

Hook para acessar o estado de autenticação e realizar operações relacionadas à autenticação.
Funciona com qualquer backend (Firebase, MongoDB ou implementações personalizadas).

As props fornecidas por este hook são:

* `user` O objeto do usuário atualmente logado, ou `null` se não estiver autenticado
* `initialLoading` Flag de carregamento inicial, usado para evitar mostrar a tela de login antes que o estado de autenticação seja determinado
* `authLoading` O processo de login/logout está em andamento
* `signOut()` Desconectar o usuário atual
* `authError` Erro durante a inicialização da autenticação
* `authProviderError` Erro despachado pelo provedor de autenticação
* `getAuthToken()` Recuperar o token de autenticação do usuário atual (retorna uma Promise)
* `loginSkipped` O usuário pulou o processo de login
* `extra` Dados adicionais armazenados no controller de autenticação (útil para papéis, permissões, etc.)
* `setExtra(extra)` Definir dados adicionais no controller de autenticação
* `setUser(user)` Definir programaticamente o usuário atual (opcional, dependente da implementação)
* `setUserRoles(roles)` Definir papéis de usuário (opcional, dependente da implementação)

Exemplo:

```tsx
import React from "react";
import { useAuthController } from "@firecms/core";

export function ExampleCMSView() {

    const authController = useAuthController();

    if (authController.authLoading) {
        return <div>Carregando...</div>;
    }

    return (
        authController.user ?
            <div>Logado como {authController.user.displayName}</div>
            :
            <div>Você não está logado</div>
    );
}
```
