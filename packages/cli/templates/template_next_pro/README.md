## FireCMS PRO starter template

Welcome to FireCMS!

This is a Next.js project bootstrapped with [create-firecms-app](https://firecms.co).
It includes a FireCMS instance connected to Firestore and a simple example of a blog and products collection.

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
pnpm dev
# or
bun dev
```

You can access the apps in:
- Website: http://localhost:3000
- FireCMS: http://localhost:3000/cms

You can find the code under the `src/app` folder.
There are some common components under `src/common`


## Firestore rules

This project reads and writes data to Firestore. 
By default the paths `products` and `blog` are used as an example.
If you don't set up the Firestore rules, you will get the error when you try to read or write data:
`Missing or insufficient permissions.`

The FireCMS PRO plugins store some configuration in `__FIRECMS`. FireCMS users and
roles are stored under this path. You probably want to grant access initially 
to your user to this path:

```
match /__FIRECMS/{document=**} {
    allow read: if true;
    allow write: if true;
}
```

After that, you can restrict your rules so only registered users can access:

```
match /{document=**} {
    allow read: if isFireCMSUser();
    allow write: if isFireCMSUser();
}

function isFireCMSUser(){
    return exists(/databases/$(database)/documents/__FIRECMS/config/users/$(request.auth.token.email));
}
```

## Frontend website

The website is a Next.js app. You can find the code under the `src/app` folder.
It includes CRUD views for the `products` and `blog` collections.
The products view includes automatic pagination and filtering.


## License 

In order to use the FireCMS PRO features you need to have a valid license key. 
The PRO features are implemented as plugins.
You can get one at [firecms.co](https://app.firecms.co/subscriptions).
When you get your API key, you can set it in the `.env` file.

