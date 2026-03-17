---
title: Gemeinsame Konfiguration
sidebar_label: Gemeinsame Konfiguration
---

Jede Eigenschaft im CMS hat ihre eigene API, aber sie teilen alle einige **gemeinsame Props**:

* `dataType` Datentyp der Eigenschaft. (z.B. `string`, `number`, etc.)

* `name` Eigenschaftsname (z.B. Preis).

* `description` Eigenschaftsbeschreibung.

* `longDescription` Längere Beschreibung eines Felds, wird unter einem Popover angezeigt.

* `columnWidth` Breite in Pixeln dieser Spalte in der Kollektionsansicht.

* `readOnly` Ist dies eine schreibgeschützte Eigenschaft? Wenn auf true gesetzt, wird sie als Vorschau gerendert.

* `disabled` Ist dieses Feld deaktiviert? Wenn auf true gesetzt, wird es als deaktiviertes Feld gerendert.
  Sie können auch eine Konfiguration angeben, die das Verhalten von deaktivierten Eigenschaften definiert.
  [PropertyDisabledConfig](../../api/interfaces/PropertyDisabledConfig)

* `Field`
  Wenn Sie ein benutzerdefiniertes Feld rendern müssen, können Sie eine Komponente erstellen, die
  `FieldProps` als Props nimmt. Sie erhalten den Wert, eine Funktion zum Aktualisieren des Werts und
  zusätzliche Utility-Props wie ob ein Fehler vorliegt.
  Weitere Details zu [benutzerdefinierten Feldern](../custom_fields.mdx)

* `Preview`
  Konfigurieren Sie, wie eine Eigenschaft als Vorschau angezeigt wird, z.B. in der Kollektionsansicht.
  Weitere Details zu [benutzerdefinierten Vorschauen](../custom_previews)

* `customProps`
  Zusätzliche Props, die an die in `Field` oder `Preview` definierten Komponenten übergeben werden.

* `defaultValue`
  Dieser Wert wird standardmäßig für neue Entities gesetzt.
