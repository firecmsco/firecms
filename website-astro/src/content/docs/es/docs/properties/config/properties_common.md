---
slug: es/docs/properties/config/properties_common
title: Configuración común
sidebar_label: Configuración común
---


Cada propiedad en el CMS tiene su propia API, pero todas comparten algunas **props comunes**:

* `dataType` Tipo de dato de la propiedad. (ej. `string`, `number`, etc.)

* `name` Nombre de la propiedad (ej. Precio).

* `description` Descripción de la propiedad.

* `longDescription` Descripción más larga de un campo, mostrada bajo un popover.

* `columnWidth` Ancho en píxeles de esta columna en la vista de colección. Si no
  se establece, el ancho se infiere basándose en las otras configuraciones.

* `readOnly` Si esta es una propiedad de solo lectura. Cuando se establece en true, se renderiza como una
  previsualización.

* `disabled` Si este campo está deshabilitado. Cuando se establece en true, se renderiza como un
  campo deshabilitado. También puedes especificar una configuración para definir el
  comportamiento de propiedades deshabilitadas (incluyendo mensajes personalizados, limpiar valor al
  deshabilitar u ocultar el campo completamente)
  [PropertyDisabledConfig](../../api/interfaces/PropertyDisabledConfig)

* `Field`
  Si necesitas renderizar un campo personalizado, puedes crear un componente que
  tome `FieldProps` como props. Recibes el valor, una función para actualizar
  el valor y props utilitarias adicionales como si hay un error. Puedes
  personalizarlo pasando props personalizadas que se reciben en el
  componente. Más detalles sobre cómo
  implementar [campos personalizados](../custom_fields.mdx)

* `Preview`
  Configura cómo se muestra una propiedad como previsualización, ej. en la vista de colección.
  Puedes personalizarlo pasando props personalizadas que se reciben en
  el componente. Más detalles sobre cómo
  implementar [previsualizaciones personalizadas](../custom_previews)

* `customProps`
  Props adicionales que se pasan a los componentes definidos en `Field` o
  en `Preview`.

* `defaultValue`
  Este valor se establecerá por defecto para nuevas entidades.

  

