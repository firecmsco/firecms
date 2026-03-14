## Rebase PRO starter template

Welcome to Rebase!

This is a Next.js project bootstrapped with [create-rebase-app](https://rebase.pro).
It includes a Rebase instance connected to Firestore and a simple example of a blog and products collection.

In order to run this project, you will need to create a Firebase project,
create a web app and copy the configuration to the `firebase_config.ts`.
(but it is likely it was configured for you already).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

You can access the apps in:
- Website: http://localhost:3000
- Rebase: http://localhost:3000/cms

You can find the code under the `src/app` folder.
There are some common components under `src/common`


## Firestore rules

This project reads and writes data to Firestore. 
By default the paths `products` and `blog` are used as an example.
If you don't set up the Firestore rules, you will get the error when you try to read or write data:
`Missing or insufficient permissions.`

The Rebase PRO plugins store some configuration in `__REBASE`. Rebase users and
roles are stored under this path. You probably want to grant access initially 
to your user to this path:

```
match /__REBASE/{document=**} {
    allow read: if true;
    allow write: if true;
}
```

After that, you can restrict your rules so only registered users can access:

```
match /{document=**} {
    allow read: if isRebaseUser();
    allow write: if isRebaseUser();
}

function isRebaseUser(){
    return exists(/databases/$(database)/documents/__REBASE/config/users/$(request.auth.token.email));
}
```

## Frontend website

The website is a Next.js app. You can find the code under the `src/app` folder.
It includes CRUD views for the `products` and `blog` collections.
The products view includes automatic pagination and filtering.


## License 

In order to use the Rebase PRO features you need to have a valid license key. 
The PRO features are implemented as plugins.
You can get one at [rebase.pro](https://app.rebase.pro/subscriptions).
When you get your API key, you can set it in the `.env` file.

