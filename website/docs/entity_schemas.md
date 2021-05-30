---
id: entity_schemas
title: Entity Schemas
sidebar_label: Entity Schemas
---

The core of the CMS are **entities**, which are defined by an `EntitySchema`. In the
schema you define the properties, which are related to the Firestore data types.

- `name` A singular name of the entity as displayed in an Add button. E.g.
  Product

- `description` Description of this entity.

- `customId` When not specified, Firestore will create a random ID. You can set
  the value to `true` to allow the users to choose the ID. You can also pass a
  set of values (as an `EnumValues` object) to allow them to pick from only
  those.

- `properties` Object defining the properties for the entity schema.

### Entity properties

You can specify the properties of an entity, using the following configuration
fields, common to all data types:

* `dataType` Firestore datatype of the property.

* `title` Property title (e.g. Product).

* `description` Property description.

* `longDescription` Width in pixels of this column in the collection view. If
  not set, the width is inferred based on the other configurations.

* `columnWidth` Longer description of a field, displayed under a popover.

* `disabled` Is this a read only property.

* `config`
    * `field`
      If you need to render a custom field, you can create a component
      that takes `FieldProps` as props. You receive the value, a function to
      update the value and additional utility props such as if there is an
      error. You can customize it by passing custom props that are received in
      the component.

    * `preview`
      Configure how a property is displayed as a preview, e.g. in the
      collection view. You can customize it by passing custom props that are
      received in the component.

    * `customProps`
      Additional props that are passed to the components defined
      in `field` or in `preview`.

You can see more details about how to implement [custom fields](custom_fields.md)


* `onPreSave` Hook called before saving, you need to return the values that will
  get saved. If you throw an error in this method the process stops, and an
  error snackbar gets displayed. (example bellow)

* `onSaveSuccess` Hook called when save is successful.

* `onPreSave` Hook called when saving fails.

* `defaultValues` Object defining the initial values of the entity on creation.

### Conditional fields from properties

When defining the properties of a schema, you can choose to use a builder
(`PropertyBuilder`), instead of assigning the property configuration directly.
In the builder you receive `PropertyBuilderProps` and return your property.

This is useful for changing property configurations like available values on the
fly, based on other values.


#### Saving callbacks

When you are saving an entity you can attach different callbacks before and
after it gets saved: `onPreSave`, `onSaveSuccess` and `onSaveFailure`.

```tsx
const productSchema = buildSchema({
    customId: true,
    name: "Product",
    onPreSave: ({
                   schema,
                   collectionPath,
                   id,
                   values,
                   status
               }: EntitySaveProps<typeof productSchema>) => {
        values.uppercase_name = values.name.toUpperCase();
        return values;
    },
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        uppercase_name: {
            title: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "This field gets updated with a preSave callback"
        },
    }
});

```


