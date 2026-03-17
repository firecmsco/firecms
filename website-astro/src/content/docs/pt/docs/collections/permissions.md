---
title: Permissões
sidebar_label: Permissões
---

Você pode definir as permissões `read`, `edit`, `create` e `delete` no nível da coleção, inclusive com base no usuário conectado.

Estas definem as ações que o usuário conectado pode realizar em uma entidade.

### Permissões simples

No caso mais simples, você pode atribuir permissões diretamente:

```tsx
import { buildCollection } from "@firecms/core";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Products",
    permissions: {
        edit: true,
        create: true,
        delete: false
    }
});
```

### Permissões avançadas

Você pode personalizar as permissões com base no usuário conectado ou qualquer outro critério adequado ao seu caso de uso.

Pode usar um `PermissionBuilder`, como no exemplo a seguir, para personalizar as ações com base no usuário conectado.

No exemplo a seguir, verificamos se anteriormente salvamos o papel "admin" no campo extras do `AuthController`.

```tsx
import { buildCollection } from "@firecms/core";

buildCollection({
    path: "products",
    collection: productCollection,
    name: "Products",
    permissions: ({
                      entity,
                      path,
                      user,
                      authController,
                      context
                  }) => {
        const isAdmin = authController.extra?.roles.includes("admin");
        return ({
            edit: isAdmin,
            create: isAdmin,
            delete: isAdmin
        });
    }
});
```

Note que você pode definir o parâmetro `extra` no `AuthController` com qualquer dado que faça sentido para você. Os locais sugeridos onde você pode querer definir esse parâmetro são `Authenticator`, já que ele é inicializado antes do restante da aplicação.

Exemplo rápido de como o campo `extra.roles` no exemplo anterior é inicializado:

```tsx
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
                                                                       user,
                                                                       authController,
                                                                       dataSource
                                                                   }) => {
    // Este é um exemplo de busca de dados assíncronos relacionados ao usuário
    // e armazenamento no campo extra do controller
    const sampleUserData = await Promise.resolve({
        roles: ["admin"]
    });
    authController.setExtra(sampleUserData);

    console.log("Allowing access to", user);
    return true; // Permitir
};
```
