---
id: properties_common
title: Common config
sidebar_label: Common config
---


Each property in the CMS has its own API, but they all share some **common props**:

* `dataType` Datatype of the property. (e.g. `string`, `number`, etc.)

* `name` Property name (e.g. Price).

* `description` Property description.

* `longDescription` Longer description of a field, displayed under a popover.

* `columnWidth` Width in pixels of this column in the collection view. If not
  set, the width is inferred based on the other configurations.

* `readOnly`Is this a read only property. When set to true, it gets rendered as a
  preview.

* `disabled`Is this field disabled. When set to true, it gets rendered as a
  disabled field. You can also specify a configuration for defining the
  behaviour of disabled properties (including custom messages, clear value on
  disabled or hide the field completely)
  [PropertyDisabledConfig]

* `Field`
  If you need to render a custom field, you can create a component that
  takes `FieldProps` as props. You receive the value, a function to update
  the value and additional utility props such as if there is an error. You
  can customize it by passing custom props that are received in the
  component. More details about how to
  implement [custom fields](../custom_fields.md)

* `Preview`
  Configure how a property is displayed as a preview, e.g. in the collection
  view. You can customize it by passing custom props that are received in
  the component. More details about how to
  implement [custom previews](../custom_previews.md)

* `customProps`
  Additional props that are passed to the components defined in `Field` or
  in `Preview`.

* `defaultValue`
  This value will be set by default for new entities.

  

