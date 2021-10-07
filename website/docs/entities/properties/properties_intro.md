---
id: properties_intro
title: Properties
sidebar_label: Properties
---

Properties define each field in a form or column in a collection included in an
entity schema. You can build properties by creating the object directly or by
using the helper method `buildProperty` (just the identity function that uses
the Typescript type system to validate the input).

You may also want to update properties dynamically, based on the entityId, the
path or the current values. Check
the [conditional fields section](../conditional_fields.md)

## Common API for every property

Each property in the CMS has its own API, but they all share some common props:

* `dataType` Datatype of the property.

* `title` Property title (e.g. Product).

* `description` Property description.

* `longDescription` Longer description of a field, displayed under a popover.

* `columnWidth` Width in pixels of this column in the collection view. If not
  set, the width is inferred based on the other configurations.

* `disabled` Is this a read only property. Note that you can also pass an object
  with the disabled configuration (including custom messages, clear value on
  disabled or hide the field completely)
  [PropertyDisabledConfig](../../api/interfaces/propertydisabledconfig.md)

* `config`

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

