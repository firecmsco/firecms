---
slug: de/docs/self/authentication
title: Authentifizierung und Benutzerverwaltung
sidebar_label: Authentifizierung und Benutzerverwaltung
description: Anleitungen zur Einrichtung von Authentifizierung und Benutzerverwaltung für eine selbst gehostete FireCMS-Instanz.
---

## Empfehlung: FireCMS Pro und Cloud

Bevor Sie eine benutzerdefinierte Authentifizierung implementieren, empfehlen wir dringend die Verwendung von **FireCMS Pro** oder **FireCMS Cloud**, die beinhalten:

- ✅ Eingebautes Benutzerverwaltungssystem
- ✅ Rollenbasierte Berechtigungen (Admin, Editor, Betrachter)
- ✅ Team-Management-Interface
- ✅ Benutzer-Einladungssystem
- ✅ Granulare Kollektion- und Feld-Berechtigungen
- ✅ Audit-Logs und Benutzeraktivitätsverfolgung
- ✅ Sicherheitsfunktionen auf Enterprise-Niveau

Diese Lösungen bieten ein vollständiges Authentifizierungs- und Autorisierungssystem out-of-the-box.

[Mehr über Benutzerverwaltung in FireCMS Pro →](/docs/pro/user_management)

[FireCMS Cloud ausprobieren →](https://app.firecms.co)


:::note

Wenn Sie ein neues FireCMS-Projekt mit der CLI initialisieren, finden Sie möglicherweise einen Boilerplate-Authenticator in Ihrer `App.tsx`-Datei:

```typescript
const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                   user,
                                                                                   authController
                                                                               }) => {
    if (user?.email?.includes("flanders")) {
        throw Error("Stupid Flanders!");
    }
    console.log("Allowing access to", user);
    return true;
}, []);
```

Dies ist nur ein Platzhalter, um Ihnen zu zeigen, wo Sie Ihre eigene Authentifizierungslogik implementieren können.

:::


## Teil 1: Grundlegende Benutzerverwaltung

Dieser Abschnitt beschreibt, wie Sie eine `users`-Kollektion zur Verwaltung von Benutzern erstellen.

### Eine „Benutzer"-Kollektion erstellen

Diese Kollektion speichert Ihre Benutzer.

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

## Teil 2: Benutzerauthentifizierung

Der `Authenticator` ist ein Callback, der bestimmt, ob ein bestimmter Benutzer Zugriff auf Ihren CMS haben soll.

```typescript
import { useCallback } from "react";
import { Authenticator } from "@firecms/core";
import { FirebaseUserWrapper } from "@firecms/firebase";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                                   user,
                                                                                   authController,
                                                                                   dataSource
                                                                               }) => {
    // Sie können jeden Benutzer basierend auf seinen Eigenschaften zulassen oder ablehnen
    if (user?.email?.includes("blocked")) {
        throw Error("Dieser Benutzer hat keinen Zugriff!");
    }
    
    console.log("Zugriff erlaubt für", user?.email);
    
    // Sie können zusätzliche Daten des Benutzers laden und im Controller speichern
    const userDoc = await dataSource.fetchEntity({
        path: "users",
        entityId: user?.uid ?? "",
        collection: usersCollection
    });
    
    authController.setExtra({ role: userDoc?.values.role });
    
    return true;
}, []);
```

## Rollenbasierte Zugriffskontrolle

Sie können basierend auf Benutzerrollen eigene Berechtigungen implementieren:

```typescript
import { PermissionsBuilder } from "@firecms/core";

const productsPermissionsBuilder: PermissionsBuilder = ({ authController }) => {
    const role = authController.extra?.role;
    return {
        read: true,
        edit: role === "admin" || role === "editor",
        create: role === "admin",
        delete: role === "admin"
    };
};

export const productsCollection = buildCollection({
    name: "Products",
    path: "products",
    permissions: productsPermissionsBuilder,
    properties: {}
});
```
