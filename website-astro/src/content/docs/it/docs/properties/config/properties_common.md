---
slug: it/docs/properties/config/properties_common
title: Configurazione comune
sidebar_label: Configurazione comune
---


Ogni proprietà nel CMS ha la propria API, ma condividono alcune **props comuni**:

* `dataType` Tipo di dato della proprietà. (es. `string`, `number`, ecc.)

* `name` Nome della proprietà (es. Prezzo).

* `description` Descrizione della proprietà.

* `longDescription` Descrizione più lunga di un campo, visualizzata in un popover.

* `columnWidth` Larghezza in pixel di questa colonna nella vista collezione. Se non
  impostata, la larghezza viene inferita in base alle altre configurazioni.

* `readOnly` Questa è una proprietà in sola lettura. Quando impostato su true, viene renderizzata come
  anteprima.

* `disabled` Questo campo è disabilitato. Quando impostato su true, viene renderizzato come
  campo disabilitato. Puoi anche specificare una configurazione per definire il
  comportamento delle proprietà disabilitate (inclusi messaggi personalizzati, cancella il valore quando
  disabilitato o nascondi completamente il campo)
  [PropertyDisabledConfig](../../api/interfaces/PropertyDisabledConfig)

* `Field`
  Se hai bisogno di renderizzare un campo personalizzato, puoi creare un componente che
  prenda `FieldProps` come props. Ricevi il valore, una funzione per aggiornare
  il valore e props di utilità aggiuntive come la presenza di errori. Puoi
  personalizzarlo passando props personalizzate che vengono ricevute nel
  componente. Maggiori dettagli su come
  implementare [campi personalizzati](../custom_fields.mdx)

* `Preview`
  Configura come una proprietà viene visualizzata come anteprima, es. nella vista
  collezione. Puoi personalizzarla passando props personalizzate che vengono ricevute nel
  componente. Maggiori dettagli su come
  implementare [anteprime personalizzate](../custom_previews)

* `customProps`
  Props aggiuntive che vengono passate ai componenti definiti in `Field` o
  in `Preview`.

* `defaultValue`
  Questo valore verrà impostato per default per le nuove entità.
