---
id: migrating_from_v1
title: Migrating from version 1.0 to 2.0
---

:::important 
FireCMS 2.0 is in alpha and the changes proposed here may break or
not be relevant in future iterations
:::

This is a guide on how to migrate FireCMS apps from version 1.0 to 2.0.

### Main config

The most significant change in version 2.0 is the inclusion of a collection
editor that allows end users to create, edit or delete collections and their
properties.

Users are now able to persist new collection configurations, by default
using the Firestore `CollectionsController` implementation. This implementation
saves the modified collection schemas in a path in the user's Firestore 
instance, under `__FIRECMS`, so make sure you have the appropriate permissions
assigned in your security rules if you would like to enable this function.

FireCMS in V2 supports using persisted collections as well as collections
defined in code, like in V1. Not every feature has been implemented using the 
collection editor. Some are specially hard, e.g. the props in collection config that
were using some kind of code callback, like the `onPreSave` or `onSaveSuccess` 
hooks. We are listening for suggestions on this part!

Allowing persisting collections in an external data source makes some
features existing in V1 hard to replicate.

For this reason navigation has been revamped: 
- The `navigation` prop has been removed and replaced with `collections` and `views`.
- It is not possible anymore to build a dynamic navigation based on the logged
user, but the same functionality should be achievable using `Roles`

### Collections

Collections and entity schemas have been merged into one single concept. All the
fields related to entity schemas have been moved to the collection level. We
felt it was redundant, and the distribution of logic between those 2 concepts
felt arbitrary.

Most of the new props in `EntityCollection` have the same signature as the
previous existing ones in `EntitySchema`, so you will be able to copy and paste
most of the config:

##### Code in version 1.0

```typescript tsx
const usersSchema = buildSchema(
    {
        name: "User",
        properties: {
            display_name: buildProperty({
                dataType: "string",
                title: "Display name"
            }),
            email: {
                dataType: "string",
                title: "Email",
                validation: {
                    email: true
                }
            }
        }
    });
    
const usersCollection = buildCollection({
        path: "users",
        schema: usersSchema,
        name: "Users",
        callbacks: {
            onPreSave: ({ values }: EntityOnSaveProps<any, any>) =>{
                return values;
            }
        },
        properties: ["display_name", "email", "country_code", "birth_year", "photo_url", "current_level", "level_points", "current_habit_refs", "challenge_id"],
        textSearchEnabled: true
    });
```

##### Code in version 2.0

```typescript tsx
    
const usersCollection = buildCollection({
        path: "users",
        name: "User",
        properties: {
            display_name: buildProperty({
                dataType: "string",
                name: "Display name"
            }),
            email: {
                dataType: "string",
                name: "Email",
                validation: {
                    email: true
                }
            }
        }
        callbacks: {
            onPreSave: ({ values }: EntityOnSaveProps<any, any>) =>{
                return values;
            }
        },
        textSearchEnabled: true
    });
```

### Properties

- The `title` prop of properties has been renamed to `name`. _Note that this is
  a critical update, and you might get a cryptic typescript error if not done_
- All the configuration options that were located under the `config` prop of
  `properties` have been moved to the property level

```typescript jsx
buildProperty<string>({
  dataType: "string",
  title: "Currency",
  config: {
    enumValues: {
      EUR: "Euros",
      DOL: "Dollars"
    }
  },
  validation: {
    required: true
  }
});
```

now becomes:

```typescript jsx
buildProperty<string>({
  dataType: "string",
  name: "Currency",
  enumValues: {
    EUR: "Euros",
    DOL: "Dollars"
  },
  validation: {
    required: true
  }
});
```

- `PreviewComponent` has been renamed to `PropertyPreview`
- `PreviewComponentProps` has been renamed to `PropertyPreviewProps`
- Validation: The `email` and `url` validation prop in string properties are now
  placed at the property level (not under `validation`). `url` now only takes a
  boolean value instead of the preview type.
- `storageMeta`prop in string properties is now called `storage`
- `name` in `FieldProps` which refers to a property key, is now
  called `propertyKey`
- `name` in `PreviewComponent` which refers to a property key, is now
  called `propertyKey`
- `name` in `CMSFormFieldProps` which refers to a property key, is now
  called `propertyKey`
- Removed `mediaType` in the storage configuration of string properties. It is
  now inferred automatically.
- `TimestampProperty` is now renamed to `DateProperty` in order to reflect
  better the alignment with JS types instead of Firebase ones. The discriminator
  when declaring date properties now is `date` instead of `timestamp`
- `toolbarActionsBuilder` in `CollectionTable` has been replaced by a prop where
  you pass a React Component directly: `Actions`
- `toolbarActionsBuilder` in `CollectionTable` has been replaced by a prop where
  you pass a React Component directly: `Actions`


