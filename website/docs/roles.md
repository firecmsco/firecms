---
id: roles 
title: Authentication, roles and permissions
---

FireCMS provides a role and permissions system used to determine which users can
perform which actions.

### Permissions

Permissions define the CRUD operations that can be performed over entities in
collections. They are defined by an object like:

```typescript jsx
import { Permissions } from "firecms";

const samplePermissions: Permissions = {
    read: true,
    create: true,
    edit: true,
    delete: false
}
```

These roles are set at the collection level. Keep in mind that you can also use 
a `PermissionsBuilder` to modify permissions based on the entity being edited,
or the logged-in user.

```typescript jsx
import { PermissionsBuilder } from "firecms";

const samplePermissions: PermissionsBuilder = ({
                                                   pathSegments,
                                                   user,
                                                   collection,
                                                   authController
                                               }) => ({
    edit: true,
    create: true,
    delete: Boolean(authController.extra?.roles?.admin)
})
```


### Roles config

Users can be assigned multiple roles or none at all.

:::note 
FireCMS can be used without specifying any roles. In that case all
users can read and modify every collection. 
:::

Roles are identified by an ID, such as `admin` or `editor`.

You can use the `isAdmin` prop to quickly create an admin role with full
permissions, and you can define the default permissions for every collection:

```typescript jsx
import { Roles } from "firecms";

const roles: Roles = {
    "admin": {
        isAdmin: true
    },
    "editor": {
        defaultPermissions: {
            read: true,
            create: true,
            edit: true,
            delete: false
        }
    }
};
```

If not specified, the default permissions for a specific role
will take all CRUD permissions to `false` as default.

### Collections config

You can also override specific collection permissions per role. Collection
specific permissions will override the rest of the available configurations,
such as `defaultPermissions`.

If you need to customise the permissions for a subcollection, you can use
the `::` notation for describing nested paths:

The subcollection with path `products/123456/locales`
becomes `products::locales`

```typescript jsx
import { Roles } from "firecms";

const roles: Roles = {
    "admin": {
        isAdmin: true
    },
    "editor": {
        isAdmin: false,
        defaultPermissions: {
            read: true,
            create: true,
            edit: true,
            delete: false
        },
        collectionPermissions: {
            "products": {
                read: true,
                create: true,
                edit: true,
                delete: true
            },
            "products::locales": {
                read: true,
                create: false,
                edit: false,
                delete: false
            }
        }
    }
};
```

The `roles` configuration is passed as a prop to your `FirebaseCMSApp` or
`FireCMS`.

### Assigning roles to users

You are responsible for implementing the logic of assigning roles to
users. You can do it at any moment using an `AuthController` which you
receive as a prop in most callbacks (either directly or under a `context` prop).

If you are building a custom component, you can also use the hook 
`useAuthController`.

A good time to assign user roles is right after the authentication process is 
completed. FireCMS provides an `Authenticator` component that allows the 
developer to allow or deny access to users, as well as defining roles.

The `AuthController` has a method `setRoles` that allows you to define roles for
a user. 

```tsx
import {
    Authenticator,
    FirebaseCMSApp,
} from "firecms";

function App() {
    // ...
    const myAuthenticator: Authenticator<FirebaseUser> = async ({
                                                                    user,
                                                                    authController
                                                                }) => {
    
        if(user?.email?.includes("flanders")){
            throw Error("Stupid Flanders!");
        }
    
        // This is an example of retrieving async data related to the user
        // and storing it in the user extra field
        const sampleRoles = await Promise.resolve(["admin"]);
        authController.setRoles(sampleRoles);
        
        console.log("Allowing access to", user);
        return true;
    };

    return <FirebaseCMSApp
        name={"My Online Shop"}
        authentication={myAuthenticator}
        // ...
    />;
}
```


:::note
If a user has multiple roles, with different permissions, they will
be merged on a collection basis into the least restrictive combination.
If a user has one role that defines read permission for a collection, but also
has a different role that denies it, he will be allowed to see it.
:::

