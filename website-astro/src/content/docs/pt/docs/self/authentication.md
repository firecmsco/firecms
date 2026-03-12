---
slug: pt/docs/self/auth_self_hosted
title: Autenticação e Gestão de Usuários
sidebar_label: Autenticação e Gestão de Usuários
description: Instruções sobre como configurar autenticação e gestão de usuários para uma instância FireCMS self-hosted.
---

## Recomendado: FireCMS Pro e Cloud

Antes de implementar autenticação personalizada, recomendamos fortemente considerar o **FireCMS Pro** ou o **FireCMS Cloud**, que incluem:

- ✅ Sistema de gestão de usuários integrado
- ✅ Permissões baseadas em papéis (Admin, Editor, Viewer)
- ✅ Interface de gestão de equipe
- ✅ Sistema de convite de usuários
- ✅ Permissões granulares por coleção e campo
- ✅ Logs de auditoria e rastreamento de atividade do usuário
- ✅ Funcionalidades de segurança de nível empresarial

Essas soluções fornecem um sistema completo de autenticação e autorização pronto para uso, economizando tempo significativo de desenvolvimento e garantindo as melhores práticas de segurança.

[Saiba mais sobre Gestão de Usuários no FireCMS Pro →](/docs/pro/user_management)

[Experimente o FireCMS Cloud →](https://app.firecms.co)


:::note

Quando você inicializa um novo projeto FireCMS usando a CLI, pode encontrar um autenticador boilerplate no seu arquivo `App.tsx`. É uma interface FireCMS padrão e tem a seguinte aparência:

```typescript
const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                   user,
                                                                                   authController
                                                                               }) => {
    if (user?.email?.includes("flanders")) {
        // Você pode lançar um erro para impedir o acesso
        throw Error("Stupid Flanders!");
    }
    console.log("Allowing access to", user);
    return true;
}, []);
```

Este é apenas um placeholder para mostrar onde implementar sua própria lógica de autenticação. Você pode substituí-lo por um dos autenticadores descritos abaixo.

:::


## Parte 1: Gestão Básica de Usuários

Esta seção explica como criar uma coleção `users` para gerenciar usuários.

### Crie uma Coleção "Users"

Esta coleção armazenará seus usuários.

```typescript
import { buildCollection, buildProperty } from "@firecms/core";

export type User = {
  name: string;
  email: string;
};

export const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  properties: {
    name: buildProperty({
      name: "Name",
      validation: { required: true },
      dataType: "string"
    }),
    email: buildProperty({
      name: "Email",
      validation: { required: true, email: true },
      dataType: "string"
    })
  }
});
```

:::tip
Não se esqueça de configurar as regras de segurança do Firestore para o caminho `users` para controlar quem pode ler e escrever na coleção.
:::

## Parte 2: Permissões Baseadas em Papéis

Agora, vamos adicionar um `role` aos nossos usuários e usá-lo para controlar o acesso.

### Passo 1: Atualize a Coleção "Users" com Papéis

Adicione uma propriedade `role` ao seu tipo `User` e à coleção.

```typescript
import { buildCollection, buildProperty } from "@firecms/core";

export enum UserRole {
  admin = "admin",
  editor = "editor",
  viewer = "viewer",
}

export type User = {
  name: string;
  email: string;
  role: UserRole;
}

export const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  properties: {
    name: buildProperty({
      name: "Name",
      validation: { required: true },
      dataType: "string"
    }),
    email: buildProperty({
      name: "Email",
      validation: { required: true, email: true },
      dataType: "string"
    }),
    role: buildProperty({
      name: "Role",
      validation: { required: true },
      dataType: "string",
      enumValues: {
        admin: "Admin",
        editor: "Editor",
        viewer: "Viewer"
      }
    })
  }
});
```

### Passo 2: Implemente um Autenticador Baseado em Papéis

Primeiro, crie um novo arquivo chamado `src/custom_authenticator.ts`.

**`src/custom_authenticator.ts`**
```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";
import { User } from "./collections/users";

export const roleBasedAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController,
  dataSourceDelegate
}) => {
  if (!user?.email) return false;

  try {
    const userEntities = await dataSourceDelegate.fetchCollection<User>({
      path: "users",
      filter: { email: ["==", user.email] }
    });

    if (userEntities && userEntities.length > 0) {
      const member = userEntities[0].values;
      authController.setExtra({
        role: member.role
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};
```

### Passo 3: Aplique Permissões às Coleções

Use o callback `permissions` nas suas coleções para controlar o acesso com base no papel do usuário.

```typescript
import { buildCollection } from "@firecms/core";
import { UserRole } from "./collections/users";

export const postsCollection = buildCollection({
  name: "Posts",
  path: "posts",
  permissions: ({ authController }) => {
    const userRole = authController.extra?.role;
    return {
      read: true, // Todos os papéis podem ler
      edit: userRole === UserRole.admin || userRole === UserRole.editor,
      create: userRole === UserRole.admin || userRole === UserRole.editor,
      delete: userRole === UserRole.admin
    };
  },
  // ... propriedades
});
```

## Parte 3: Usando Custom Claims do Firebase para Permissões

Uma alternativa ao armazenamento de papéis no Firestore é usar os custom claims do Firebase Authentication.

### Passo 1: Defina os Custom Claims

Você precisa definir custom claims para um usuário a partir de um ambiente backend usando o SDK Firebase Admin. Isso é tipicamente feito em uma Cloud Function.

```typescript
// Exemplo de Cloud Function para definir um claim de papel
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Must be an admin to set roles.");
  }

  const { uid, role } = data;
  await admin.auth().setCustomUserClaims(uid, { role });

  return { message: `Success! User ${uid} has been given the role of ${role}.` };
});
```

### Passo 2: Implemente um Autenticador Baseado em Claims

```typescript
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

export const claimsAuthenticator: Authenticator<FirebaseUserWrapper> = async ({
  user,
  authController
}) => {
  if (!user) return false;

  try {
    const idTokenResult = await user.firebaseUser.getIdTokenResult(true);
    const role = idTokenResult.claims.role || "viewer";
    authController.setExtra({ role });
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};
```

## Melhores Práticas de Segurança

- **Regras de Segurança do Firestore**: Sempre aplique regras de segurança no seu backend. As permissões do lado do cliente são para fins de UI/UX e podem ser contornadas.
- **Validação no Lado do Servidor**: Para operações críticas, valide permissões em um servidor.
- **Princípio do Menor Privilégio**: Conceda aos usuários o nível mínimo de acesso necessário.
