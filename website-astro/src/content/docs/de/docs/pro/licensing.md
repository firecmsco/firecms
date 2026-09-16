---
title: Lizenzierung
slug: de/docs/pro/licensing
description: Preise von FireCMS PRO, die 30-tägige Testphase in Produktion, was ohne Lizenz pausiert und wie Sie Ihren Lizenzschlüssel setzen.
---

:::tip
Haben Sie Fragen oder benötigen Sie eine individuelle Lizenz?
Bitte [kontaktieren Sie uns per E-Mail](mailto:hello@firecms.co)
oder [planen Sie einen Anruf](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true).
:::

## Preis

FireCMS PRO kostet **€99 / Monat für das erste Projekt** und **€49 / Monat für jedes weitere Projekt** auf derselben Lizenz.

| | Monatlich | Jährlich |
|---|---|---|
| Erstes Projekt | €99 ($119) | €990 ($1.190) |
| Jedes weitere Projekt | €49 ($59) | €490 ($590) |

- **Die Einheit ist ein Firebase-Projekt.** Jedes Projekt, das mit einer Lizenz verknüpft ist, zählt gleich. Es gibt keinen Unterschied zwischen Entwicklung, Staging und Produktion: Eine App mit getrennten Firebase-Projekten für Dev, Staging und Prod sind drei Projekte.
- **Unbegrenzt viele Nutzer.** Fügen Sie jedem Projekt so viele Nutzer hinzu, wie Sie brauchen.
- **Alle Projekte auf eine Lizenz.** Der Preis von €49 gilt für Projekte auf derselben Lizenz, daher ist eine Lizenz günstiger als mehrere. Prod und Staging auf einer Lizenz kosten €99 + €49 = €148 / Monat. Fünf Kundenprojekte auf einer Lizenz kosten €99 + 4 × €49 = €295 / Monat, auf fünf getrennten Lizenzen wären es €495.

## 30 Tage kostenlos testen

PRO ist **30 Tage lang in Produktion** kostenlos. Zum Start brauchen Sie weder Kreditkarte noch Lizenzschlüssel.

Die Testphase eines Firebase-Projekts beginnt, sobald eine deployte App, also alles, was nicht von `localhost`, `127.0.0.1` oder `[::1]` ausgeliefert wird, zum ersten Mal ein PRO-Plugin mit diesem Projekt ausführt. Für die lokale Entwicklung brauchen Sie nie eine Lizenz.

## Was nach der Testphase passiert

Hat ein Projekt am Ende der Testphase keine gültige Lizenz, oder läuft seine Lizenz aus, pausieren diese PRO-Funktionen:

- der Kollektions-Editor (Schema-Editor)
- Import und Export
- der Entitätsverlauf
- Data Enhancement (KI-Autofill)
- DataTalk

Die App selbst funktioniert weiter. Anmeldung, Ihre Daten, im Code definierte Kollektionen und mit dem Schema-Editor gespeicherte Kollektionen werden weiterhin geladen und lassen sich bearbeiten. Die Benutzerverwaltung übernimmt weiterhin Anmeldung und Rollen, aber ihre Bildschirme für Benutzer und Rollen zeigen einen Hinweis, dass sie pausiert sind. Ein Banner in der App verlinkt auf die Seite, auf der Sie eine Lizenz erhalten. Sobald das Projekt auf einer aktiven Lizenz ist, sind die pausierten Funktionen beim nächsten Laden der App wieder da.

Eine Lizenz deckt so viele Projekte in Produktion ab, wie sie bezahlt. Laufen mehr ihrer Projekte in Produktion, behalten die zuerst live gegangenen PRO, und bei den übrigen wird PRO wie oben beschrieben pausiert, bis die Lizenz sie bezahlt. Lokale Entwicklung zählt nie mit.

## Plugins, die eine Lizenz benötigen

| Plugin | Paket |
|---|---|
| Kollektions-Editor | `@firecms/collection_editor` |
| Benutzerverwaltung | `@firecms/user_management` |
| Import und Export | `@firecms/data_import`, `@firecms/data_export`, `@firecms/data_import_export` |
| Entitätsverlauf | `@firecms/entity_history` |
| Data Enhancement | `@firecms/data_enhancement` |
| DataTalk | `@firecms/datatalk` |

Der Media Manager, das Firebase-Admin-Plugin und Ihre eigenen Plugins brauchen keine Lizenz. Eine App ohne die oben genannten Plugins ist FireCMS Community, kostenlos unter der MIT-Lizenz.

## Lizenz erhalten und Schlüssel setzen

1. Öffnen Sie [app.firecms.co/subscriptions](https://app.firecms.co/subscriptions?intent=pro) und melden Sie sich an.
2. Erstellen Sie eine PRO-Lizenz und fügen Sie die ID jedes Firebase-Projekts hinzu, das sie abdecken soll. Die Projekt-ID finden Sie in der Firebase-Konsole unter **Projekteinstellungen**.
3. Kopieren Sie den Lizenzschlüssel und übergeben Sie ihn der `FireCMS`-Komponente als `apiKey`:

```tsx
<FireCMS
    apiKey={import.meta.env.VITE_FIRECMS_API_KEY}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}
    plugins={plugins}>
    {/* ... */}
</FireCMS>
```

Wenn Sie mit dem PRO-Template (`npx create-firecms-app --pro`) begonnen haben, setzen Sie `VITE_FIRECMS_API_KEY` in der `.env`-Datei; das Template übergibt ihn bereits an `FireCMS`.

Wenn ein neues Projekt dazukommt, etwa eine Staging-Umgebung oder ein neuer Kunde, fügen Sie seine ID derselben Lizenz hinzu, statt eine neue anzulegen. So wird es zum Preis von €49 abgerechnet.

## Telemetrie

Die Lizenzprüfung ist eine einzelne Anfrage des Browsers an `api.firecms.co`, wenn ein angemeldeter Nutzer die App öffnet. Unter [Telemetrie](/de/docs/self/telemetry) steht genau, was gesendet und gespeichert wird und warum.
