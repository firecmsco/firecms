---
slug: de/docs/self/telemetry
title: Telemetrie und Lizenzprüfung
sidebar_label: Telemetrie
description: Die eine Anfrage, die eine selbst gehostete FireCMS-App an FireCMS sendet, was sie enthält, was wir speichern und warum, und wie Sie sie in Community abschalten.
---

Eine selbst gehostete FireCMS-App liest und schreibt Ihre Daten direkt aus dem Browser, mit dem SDK von Firebase oder MongoDB. An FireCMS sendet sie eine einzige Anfrage: das Zugriffsprotokoll, das zugleich die PRO-Lizenzprüfung ist. Diese Seite listet genau auf, was diese Anfrage enthält und was wir aufbewahren.

## Wann sie gesendet wird

Einmal pro angemeldetem Nutzer bei jedem Laden der App: Wenn sich ein Nutzer anmeldet oder die App mit einem bereits angemeldeten Nutzer geöffnet wird, sendet der Browser eine `POST`-Anfrage an `https://api.firecms.co/access_log`. Das gilt auch für die lokale Entwicklung.

## Was die Anfrage enthält

- **`Authorization`-Header**: das ID-Token des angemeldeten Nutzers von Ihrem Auth-Anbieter (zum Beispiel Firebase Authentication).
- **`Referer`-Header**: vom Browser gesetzt; die URL der Seite, auf der die App läuft.
- **Body**:
  - `apiKey`: Ihr PRO-Lizenzschlüssel, falls gesetzt
  - `email`: die E-Mail-Adresse des angemeldeten Nutzers
  - `datasource`: der Schlüssel der verwendeten Datenquelle, zum Beispiel `firestore`
  - `plugins`: die Schlüssel der konfigurierten Plugins, zum Beispiel `["collection_editor", "user_management"]`

Die Anfrage enthält keine Datenbank-Zugangsdaten, keine Dokumente oder sonstigen Inhalte aus Firestore oder Atlas und keine Kollektionsschemas.

## Was wir speichern

Unser Server liest die Firebase-Projekt-ID aus dem ID-Token und speichert pro Anfrage einen Eintrag mit:

- der Firebase-Projekt-ID und, falls ein Lizenzschlüssel gesendet wurde, der Lizenz-ID
- der uid und E-Mail-Adresse des Nutzers
- den dekodierten Claims des ID-Tokens. Dazu gehören uid und E-Mail sowie Anzeigename, Foto-URL und Anmeldeanbieter, wenn Ihr Auth-Anbieter sie setzt.
- der Referer-URL
- dem Schlüssel der Datenquelle und den Plugin-Schlüsseln
- dem Ergebnis der Lizenzprüfung (ob PRO-Funktionen pausiert wurden)
- einem Zeitstempel

Die Einträge liegen in unserem Google-Cloud-Projekt, in Firestore und als Kopie in BigQuery für Nutzungsauswertungen. Der Body der Anfrage wird außerdem, ohne den Lizenzschlüssel, in unsere Server-Logs geschrieben.

## Warum

- **Lizenzprüfung.** Für ein Projekt mit PRO-Plugins sagt die Antwort der App, ob diese laufen oder pausieren.
- **Die Uhr der Testphase.** Die [30-tägige Testphase in Produktion](/de/docs/pro/licensing) eines Projekts beginnt mit seinem ersten Eintrag aus einer deployten App, die PRO-Plugins nutzt.
- **Nutzungszahlen.** Wie viele Projekte und Nutzer FireCMS Community und PRO einsetzen und welche Plugins sie verwenden.

## E-Mails

Wenn eine deployte App PRO-Plugins nutzt, schreiben wir der E-Mail-Adresse aus dem Eintrag auch zu PRO: eine Willkommens-E-Mail, wenn das Projekt zum ersten Mal PRO ausführt, eine Nachfrage etwa 14 Tage später und einen Hinweis, falls die Lizenzprüfung PRO-Funktionen pausiert. Keine davon geht für dasselbe Projekt zweimal an dieselbe Adresse.

## Aufbewahrung

Einträge werden derzeit ohne festes Löschdatum aufbewahrt. Schreiben Sie an [hello@firecms.co](mailto:hello@firecms.co), um die Einträge Ihres Projekts löschen zu lassen.

## Abschalten

In einer App ohne `apiKey` und ohne PRO-Plugin übergeben Sie `telemetry={false}` an `FireCMS`, und die Anfrage wird gar nicht gesendet:

```tsx
<FireCMS
    telemetry={false}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}>
    {/* ... */}
</FireCMS>
```

Ist ein `apiKey` gesetzt oder ein PRO-Plugin eingebunden (Collection-Editor, Benutzerverwaltung, Import/Export, Entity-Historie, Data Enhancement, DataTalk), wird die Anfrage immer gesendet: Sie ist die Lizenzprüfung und startet die Testphase.

## Weitere Anfragen an FireCMS

Diese Seite behandelt nur das Zugriffsprotokoll. Die optionalen KI-Funktionen (Data Enhancement, DataTalk und die KI-Kollektionserstellung im Kollektions-Editor) senden die Felder und Prompts, mit denen Sie sie nutzen, an `api.firecms.co`. Sie laufen nur, wenn Sie sie Ihrer App hinzufügen.
