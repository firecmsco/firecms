---
slug: docs/self/controllers
title: Building a custom backend
description: Learn how to implement custom DataSource, StorageSource, and AuthController for Rebase with your own backend.
---

Rebase internally uses 3 main controllers to manage the data, file storage and authentication.
These controllers are designed to be easily extended and replaced with your own implementations.

Rebase provides default implementations for PostgreSQL through the `usePostgresClientDataSource` hook,
but you can replace them with your own implementations.

## DataSource

The `DataSource` is the delegate responsible for managing the data source. The delegate will
be passed to Rebase and will be used internally by the `DataSource`.

You can retrieve the data source in any component using the `useDataSource` hook. You can also access the data source
from callbacks where there is a `context` object defined, under `context.dataSource`.

Rebase provides default implementations for:

- PostgreSQL `usePostgresClientDataSource` (package `@rebasepro/postgres`)

### Creating your own DataSource

If you want to create your own `DataSource`, you will need to implement the following methods:

**fetchCollection**: Used to fetch a collection of entities from your data source. Accepts various parameters
like `path`, `filter`, `limit`, etc.

**listenCollection**: (Optional) Listen for real-time updates on a collection. Returns a function to cancel the
subscription. If not implemented, the `fetchCollection` method will be used instead.

**fetchEntity**: Fetch a single entity based on `path` and `entityId`.

**listenEntity**: (Optional) Listen for real-time updates on a single entity. Returns a function to cancel the
subscription. If not implemented, the `fetchEntity` method will be used instead.

**saveEntity**: Save or update an entity at a specific path.

**deleteEntity**: Delete an entity by providing the entity to delete.

**checkUniqueField**: Check the uniqueness of a particular field in a collection.

**generateEntityId**: Generate a unique ID for a new entity.

**countEntities**: (Optional) Count the number of entities in a collection.

**isFilterCombinationValid**: (Optional) Check if a given filter combination is valid.

**currentTime**: (Optional) Get the current timestamp object.

**delegateToCMSModel**: Convert data from the source model to CMS model.

**cmsToDelegateModel**: Convert data from the CMS model to the source model.

**initTextSearch**: (Optional) Initialize text search capabilities.

## StorageSource

The `StorageSource` is the controller responsible for managing file storage. The delegate will
be passed to Rebase and will be used internally by the CMS.

You can access the storage source in any component using the `useStorageSource` hook. You can also access the storage
source from callbacks where there is a `context` object defined, under `context.storageSource`.

Rebase provides a built-in storage source that stores files on the server's filesystem via the backend API.

### Description of Methods

**uploadFile**: Upload a file to storage, specifying a name and a path. Accepts parameters
like `file`, `fileName`, `path`, `metadata`, and `bucket`.

**getDownloadURL**: Convert a storage path or URL into a download configuration. Accepts `pathOrUrl` and
optionally `bucket`.

**getFile**: Retrieve a file from a storage path. Returns `null` if the file does not exist. Accepts `path` and
optionally `bucket`.

## AuthController

The `AuthController` is the controller responsible for managing authentication. The delegate will
be passed to Rebase and will be used internally by the CMS.

You can access the auth controller in any component using the `useAuthController` hook.
You can also access the auth controller from callbacks where there is a `context` object defined,
under `context.authController`.

Rebase provides a built-in authentication system with JWT tokens managed by the backend.

### Description of Properties and Methods

**user**: The user currently logged in. Can be the user object or `null` if login was skipped.

**roles**: (Optional) Roles related to the logged-in user.

**initialLoading**: (Optional) A flag used to avoid displaying the login screen when the app first loads and the login
status has not yet been determined.

**authLoading**: A flag used to display a loading screen while the user is logging in or out.

**signOut**: A method to sign out the user. Returns a `Promise<void>`.

**authError**: (Optional) An error object representing issues initializing authentication.

**authProviderError**: (Optional) An error object dispatched by the authentication provider.

**getAuthToken**: A method to retrieve the authentication token for the current user. Returns a `Promise<string>`.

**loginSkipped**: A flag indicating whether the user skipped the login process.

**extra**: An object containing additional data related to the authentication controller.

**setExtra**: A method to set the additional data for the authentication controller. Accepts `extra` parameter of
type `ExtraData`.

#### Auth Methods

**googleLogin**: A method to initiate login using Google authentication.

**anonymousLogin**: A method to log in anonymously.

**appleLogin**: A method to initiate login using Apple authentication.

**emailPasswordLogin**: A method to log in using an email and password. Takes `email` and `password` as parameters.

**createUserWithEmailAndPassword**: A method to create a new user using an email and password. Takes `email` and `password` as parameters.

**sendPasswordResetEmail**: A method to send a password reset email. Takes `email` as a parameter and returns a `Promise<void>`.

**skipLogin**: A method to skip the login process.

**setUser**: A method to set the user object. Takes `user` of type `User` or `null` as a parameter.

**setRoles**: A method to set roles for the logged-in user. Takes an array of `Role` objects as a parameter.
