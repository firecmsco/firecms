---
slug: de/docs/self/controllers
title: Benutzerdefiniertes Backend erstellen
description: Erfahren Sie, wie Sie benutzerdefinierte DataSourceDelegate, StorageSource und AuthController für FireCMS mit Ihrem eigenen Backend implementieren.
---

FireCMS verwendet intern 3 Hauptcontroller zur Verwaltung von Daten, Dateispeicherung und Authentifizierung.
Diese Controller sind so konzipiert, dass sie leicht erweitert und durch eigene Implementierungen ersetzt werden können.

FireCMS bietet Standard-Implementierungen für Firebase, Firestore und Firebase Authentication,
aber Sie können jederzeit Ihre eigenen Implementierungen bereitstellen.

## DataSourceDelegate

Der `DataSourceDelegate` ist der Controller, der für die Verwaltung der Daten zuständig ist. Der Delegate wird
an FireCMS übergeben und intern vom CMS verwendet.

Sie können auf die Datenquelle in jeder Komponente mit dem `useDataSource`-Hook zugreifen.

FireCMS bietet Standard-Implementierungen für:
- Firebase Firestore `useFirestoreDelegate` (Paket `@firecms/firebase`)
- MongoDB `useMongoDBDelegate` (Paket `@firecms/mongodb`)

### Eigene DataSourceDelegate erstellen

Wenn Sie Ihre eigene `DataSourceDelegate` erstellen möchten, müssen Sie folgende Methoden implementieren:

**fetchCollection**: Wird verwendet, um eine Kollektion von Entities aus Ihrer Datenquelle abzurufen.

**listenCollection**: (Optional) Auf Echtzeit-Updates einer Kollektion hören. Gibt eine Funktion zurück, um die Subscription zu beenden.

**fetchEntity**: Eine einzelne Entity basierend auf `path` und `entityId` abrufen.

**listenEntity**: (Optional) Auf Echtzeit-Updates einer einzelnen Entity hören.

**saveEntity**: Eine Entity an einem bestimmten Pfad speichern oder aktualisieren.

**deleteEntity**: Eine Entity löschen.

**checkUniqueField**: Die Eindeutigkeit eines Felds in einer Kollektion überprüfen.

**generateEntityId**: Eine eindeutige ID für eine neue Entity generieren.

**countEntities**: (Optional) Die Anzahl der Entities in einer Kollektion zählen.

**delegateToCMSModel**: Daten vom Quellmodell zum CMS-Modell konvertieren.

**cmsToDelegateModel**: Daten vom CMS-Modell zum Quellmodell konvertieren.

## StorageSource

Der `StorageSource` ist der Controller für die Verwaltung der Dateispeicherung.

FireCMS bietet Standard-Implementierungen für:
- Firebase Storage `useFirebaseStorageSource` (Paket `@firecms/firebase`)

### Beschreibung der Methoden

**uploadFile**: Eine Datei in den Speicher hochladen.

**getDownloadURL**: Einen Speicherpfad oder eine URL in eine Download-Konfiguration konvertieren.

**getFile**: Eine Datei aus einem Speicherpfad abrufen.

## AuthController

Der `AuthController` ist der Controller für die Verwaltung der Authentifizierung.

FireCMS bietet Standard-Implementierungen für:
- Firebase `useFirebaseAuthController` (Paket `@firecms/firebase`)
- MongoDB `useMongoDBAuthController` (Paket `@firecms/mongodb`)

### Beschreibung der Eigenschaften und Methoden

**user**: Der aktuell eingeloggte Benutzer.

**roles**: (Optional) Rollen des eingeloggten Benutzers.

**initialLoading**: Flag zur Vermeidung des Login-Bildschirms beim ersten Laden.

**authLoading**: Flag zur Anzeige eines Ladebildschirms während des Login/Logout.

**signOut**: Methode zur Abmeldung des Benutzers.

**getAuthToken**: Methode zum Abrufen des Auth-Tokens.

**extra**: Zusätzliche Daten des Auth-Controllers.

**setExtra**: Methode zum Setzen der zusätzlichen Daten.
