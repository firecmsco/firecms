## FireCMS PRO starter template

Welcome to FireCMS!

This is a starter template for your next project. It includes the basic
configuration to get you started.

In order to run this project, you will need to create a Firebase project,
create a web app and copy the configuration to the `firebase_config.ts`.
(but it is likely it was configured for you already).

### Running the project

Install the dependencies:

```bash
yarn
```

And run the project locally:

```bash
yarn dev
```

### Building the project

Make sure you update your `package.json` `build` script with the correct
project name. Then run:

```bash
yarn build
```

## Firestore rules

This project reads and writes data to Firestore.

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

### Deploying the project

You can develop your project locally without a license, but you will need to purchase one to deploy it. There is a grace
period after the first deployment to allow you to test it in production.

You can create one in the [FireCMS subscriptions](https://app.firecms.co/subscriptions).
When you get your API key, you can set it in the `.env` file.

When creating your license, you need to specify the project IDs that will be using the license. You can find your
project ID in the Firebase console.

You will receive an API key that you need to pass to your FireCMS component. If you are using the starter template, you
can set it in the .env file.




