---
id: migrating_from_v1
title: Migrating from version 1.0 to 2.0
---

:::important 
The package name has change from `@Camberi/firecms` to `firecms`. 
Please update your dependencies accordingly
:::

In order to update the dependencies to the new version you can run the 
command

```
yarn add firecms@^2.0.0 firebase@^9 @mui/material@^5 @mui/icons-material@^5 @mui/lab@latest @mui/x-date-pickers@^5.0.0-beta.1 @emotion/react @emotion/styled react-router@^6 react-router-dom@^6
```

This is a guide on how to migrate FireCMS apps from version 1.0 to 2.0.

### Main config

The main navigation has been revamped: 
- The `navigation` prop has been removed and replaced with `collections`
  and `views`.
- If you need to have dynamic collections or views based on the user or other
  config, you can use a `EntityCollectionsBuilder` or `CMSViewsBuilder` in an
  analogous way to v1, though the return types are different.
- The authentication and authorization logic has been moved away from `FireCMS`
  and now it is handled externally. Note that this only affects you if you are
  using a custom app, **not** if you are using the usual `FirebaseCMSApp`
- Every prop of type `React.ReactNode` is now spelled in lowercase for consistency.
  For example, `AdditionalComponent` is now `additionalComponent`.
  Or `Actions` is now `actions`.
- Every prop of type `React.ComponentType` is now spelled in uppercase for consistency.
  For example, `icon` is now `Icon`.
  Or `Actions` is now `actions`.
- If you are using `FireCMS` instead of `FirebaseAppCMS`:
- You need to add an additional `SnackbarProvider` and a `ModeControllerProvider`
  in your tree.
  It was provided by `FireCMS` before, but we treat it as a separate component
  now for better customization.

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

- `AdditionalColumnDelegate` has been renamed to `AdditionalFieldDelegate`. 
  The signature is the same. The prop in the collection is now called
  `additionalFields`, instead of `additionalColumns`.
- `extraActions` has been renamed to `Actions`. The signature is the
  same. `ExtraActionsParams` has been renamed to `CollectionActionsProps`. 
- `EntityPermissionsBuilderProps` has been renamed to `PermissionsBuilderProps` and
 `EntityPermissionsBuilder` has been renamed to `PermissionsBuilder`

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

- The `buildPropertyField` utility function has been replaced by a component
  called `PropertyFieldBinding`. The props have not changed.
- `CMSFormFieldProps` have been renamed to `PropertyFieldBindingProps`
- `TimestampProperty` is now renamed to `DateProperty` in order to reflect
  better the alignment with JS types instead of Firebase ones. The discriminator
  when declaring date properties now is `date` instead of `timestamp`.

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
- `toolbarActionsBuilder` in `CollectionTable` has been replaced by a prop where
  you pass a React Component directly: `Actions`
- `toolbarActionsBuilder` in `CollectionTable` has been replaced by a prop where
  you pass a React Component directly: `Actions`
- Enum values: if you are using enum values with custom configurations, you
need to include the id in the new object as well
- `skipLoginButtonEnabled` renamed to `allowSkipLogin` in `FirebaseLoginViewProps`
```tsx
buildProperty(({ values }) => ({
  title: "Status",
  dataType: "string",
  enumValues: {
    published: {
      id: "published", // new compulsory field
      label: "Published",
      disabled: !values.header_image,
    },
    draft: "Draft"
  }
}))
```

- `LoginViewProps` has been replaced by `LoginView` in `FirebaseCMSAppProps`. If
  you were overriding the `LoginViewProps` before, you can now simply pass a
  component that wraps `FirebaseLoginView`. This allows you to keep control of
  the login view and add additional state if you need it. The simplest component
  you would pass to `LoginView` looks like:

```tsx
import { FirebaseLoginView, FirebaseLoginViewProps } from "@firecms/core";

export function CustomLoginView(props: FirebaseLoginViewProps) {
  return <FirebaseLoginView {...props}/>;
}
```
 
### Style changes

One of the fonts used by FireCMS has changed, and you need to update the imports
to reflect it:

Before in V1:

```
import "typeface-rubik";
import "typeface-space-mono";
```

afterwards in V2:

```
import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
```

### Custom apps

The authorization and authentication logic has been moved away from the core of
the `FireCMS` component, and now it is handled by the components implementing 
it. 

Specifically, the `Authenticator` logic has been extracted into a new hook
`useValidateAuthenticator` from the core. You are free to use it in your 
implementation as before or use your custom logic, for displaying the 
login screen when needed. It is now easier to implement you `AuthController`
and your custom login flow.

Check a sample [custom app](./custom_cms_app) for referece
