---
title: "Ihr Firebase CMS und Admin-UI deployen"
slug: de/docs/cloud/deployment
sidebar_label: Deployment
description: "Deployen Sie Ihren benutzerdefinierten React-CMS und Admin-Panel-Code zu FireCMS Cloud. Vollständig verwaltetes Hosting für Ihr Firestore Content-Management-System."
---

## Deployment zu FireCMS Cloud

FireCMS ist einzigartig unter den CMS-Systemen, da es das Hochladen von benutzerdefiniertem Code
in seine Cloud-Version ermöglicht. Diese sehr fortgeschrittene Funktion ermöglicht es Ihnen, das
CMS nach Ihren Anforderungen anzupassen.

Der Code wird mit **Module Federation** und **Vite** gebündelt und kompiliert. Das bedeutet, dass Sie
jedes npm-Paket verwenden können, das Sie für den Aufbau Ihres CMS benötigen.

Deployen Sie Ihren Code zu [FireCMS Cloud](https://app.firecms.co) mit einem einzigen Befehl:

```bash
npm run deploy
```

oder

```bash
yarn deploy
```

## Firebase in Ihrem Code importieren

FireCMS Cloud stellt Ihrem Code React, die FireCMS-Pakete und das Firebase SDK bereit, daher
enthält Ihr Build keine eigene Kopie davon. Es sind die Pakete, die unter `shared` in Ihrer
`vite.config.ts` aufgeführt sind, und nur Importe, die eines davon exakt benennen, erhalten die
Kopie von FireCMS.

Für Firebase heißt das: Importieren Sie aus den Paketen `@firebase/…`, nicht aus den
Einstiegspunkten `firebase/…`:

```ts
// Nicht so: Der Build verweist auf eine Datei, die er nie erzeugt
import { getFunctions, httpsCallable } from "firebase/functions";

// Sondern so
import { getApp } from "@firebase/app";
import { getFunctions, httpsCallable } from "@firebase/functions";
```

Dasselbe gilt für `@firebase/firestore`, `@firebase/auth`, `@firebase/storage`,
`@firebase/analytics`, `@firebase/remote-config` und `@firebase/app-check`. Sie werden zusammen mit
`firebase` installiert; wenn Ihr Paketmanager sie nicht auf oberster Ebene installiert (zum Beispiel
pnpm), fügen Sie die importierten Pakete Ihrer `package.json` hinzu.

`getApp()` liefert die Firebase-App Ihres Projekts, dieselbe, die FireCMS verwendet. FireCMS hat sie
beim Laden Ihres Codes möglicherweise noch nicht initialisiert. Rufen Sie `getApp()`,
`getFunctions()`, `getFirestore()` und Ähnliches daher erst auf, wenn Ihr Code ausgeführt wird, in
einer Komponente oder einem Callback, nicht auf oberster Ebene einer Datei.

## Fehlerbehebung

### "Error loading remote config"

FireCMS zeigt diese Meldung, wenn es Ihren bereitgestellten Code nicht laden oder ausführen kann.
Öffnen Sie die Browserkonsole, um die Ursache zu sehen:

- **Ein 404 für eine Datei namens `__federation_shared_…`**, oft gefolgt von einer Meldung über einen
  nicht zulässigen MIME-Typ (`application/json`): Ihr Code importiert ein geteiltes Paket über einen
  anderen Pfad, meist `firebase/…` statt `@firebase/…`. Siehe
  [Firebase in Ihrem Code importieren](#firebase-in-ihrem-code-importieren). Neuere Versionen von `firecms deploy` erkennen das
  vor dem Hochladen und nennen die zu ändernden Importe.
- **Eine Ausnahme aus Ihrem eigenen Code**: Beim Laden Ihrer Konfiguration ist etwas fehlgeschlagen,
  etwa ein Aufruf von `getFirestore()` auf oberster Ebene einer Datei, bevor Firebase initialisiert
  war. Der Stacktrace zeigt die Stelle.

Dass `dist/assets` keine Dateien `__federation_shared_…` enthält, ist zu erwarten und kein Zeichen
für einen fehlerhaften Build: FireCMS stellt diese Pakete bereit, daher enthält der Build sie nicht.

### Ein 404 für `material-icons-….woff2`

Wenn die Konsole einen 404 für `/assets/material-icons-….woff2` auf `api.firecms.co` zeigt, werden
Icons in Ihrem Code möglicherweise nicht angezeigt. Ihre `vite.config.ts` ist älter als die
Korrektur der Schrift-URLs in der Vorlage: Kopieren Sie den Block `experimental.renderBuiltUrl` aus
der [`vite.config.ts` der FireCMS Cloud-Vorlage](https://github.com/firecmsco/firecms/blob/main/packages/cli/templates/template_cloud/vite.config.ts) in Ihre Datei, dann bauen und deployen Sie
erneut.

## Deployment außerhalb von FireCMS Cloud

Wenn Sie ein **FireCMS PRO**-Abonnement haben, können Sie Ihr CMS außerhalb von FireCMS Cloud deployen.

Sie können Ihr Projekt auf Firebase Hosting oder jedem anderen statischen Hosting-Anbieter deployen.

```bash
npm run build && firebase deploy --only hosting
```
