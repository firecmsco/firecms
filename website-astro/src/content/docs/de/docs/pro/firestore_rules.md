---
title: Firestore-Regeln
slug: de/docs/pro/firestore_rules
sidebar_label: Firestore Rules
description: Konfigurieren Sie Firestore-Sicherheitsregeln für FireCMS PRO, um Benutzerverwaltungs- und Kollektionskonfigurationsdaten zu schützen.
---

:::note
Diese Regeln gelten speziell für die Konfiguration der FireCMS PRO-Plugins. Wenn Sie die Community-Version verwenden,
empfehlen wir Ihnen, eigene Regeln zu schreiben, um Ihre Daten zu sichern.
:::

FireCMS PRO speichert einige Konfigurationsdaten in Firestore zur Verwaltung von Benutzerrollen und Berechtigungen sowie der Kollektionskonfiguration.

Die Standard-Pfade, die von FireCMS verwendet werden:

- `__FIRECMS/config/users`
- `__FIRECMS/config/roles`
- `__FIRECMS/config/collections`

### Erstmalige Einrichtungsregeln

Je nach Ihrem Projekt-Setup hat der eingeloggte Benutzer möglicherweise keine Schreibberechtigung für die Firestore-Datenbank im FireCMS-Konfigurationspfad. In diesem Fall empfehlen wir, vorübergehend den Zugriff auf den `__FIRECMS`-Pfad zu erlauben:

```
match /__FIRECMS/{document=**} {
  allow read: if true;
  allow write: if true;
}
```

### Empfohlene finale Regeln

Nachdem Sie den ersten Benutzer und die Rollen erstellt haben, können Sie den Zugriff auf den `__FIRECMS`-Pfad wieder einschränken:

```
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/users/$(request.auth.token.email));
}
```

Diese Regeln erlauben Benutzern mit einer CMS-Rolle, alle Daten in Ihrer Firestore-Datenbank zu lesen und zu schreiben.
