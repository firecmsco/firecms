---
id: firebase_setup
title: Firebase setup
sidebar_label: Firebase setup
---

:::important
After you have created a FireCMS Cloud project, your Firebase
project will be automatically configured for you.
:::

In order to run **FireCMS**, you need to have a Firebase project, with
some requirements:

### Firestore

You need to enable **Firestore**. You are free to define your own 
security rules to enable read and write access to your collections.

Keep in mind that rules should be defined for each collection and should be
defined in a way that is suited for your domain.

Please check the [Firestore documentation](https://firebase.google.com/docs/firestore/security/get-started)
for more information.

:::important
In a default Firestore project, it is likely that your Firestore rules
will not allow you to read or write to the database. Continue reading to
learn how to set up your rules.
:::

FireCMS will use the following rules by default:

```
rules_version = '2';
service cloud.firestore {
  match /{document=**} {
    allow read, write: if request.auth.token.fireCMSUser;
  }
  // ...rest of your rules
}
```

Users managed by FireCMS will have a custom claim `fireCMSUser` that will
allow them to read and write to the database.

FireCMS still enforces frontend security though the roles defined in the
CMS. Anyhow, if you need to make sure that some users cannot access certain
collections, you should define your own rules.


### Web app

In the project settings, you need to create a **Web app** within your
project, from which you can get your Firebase config as a Javascript object.
That is the object that you need to pass to the CMS.

After initializing the CMS, you should have a webapp created in your Firebase
project, called FireCMS.

![firebase_setup](/img/firebase_setup_app.png)

:::tip Firebase Hosting
Note that you can also link your new webapp to **Firebase Hosting** which will
allow you to deploy it with very little effort. You can create the
Firebase Hosting site at a later stage and link it to your webapp.
:::

### Authentication

You will most likely want to enable authentication in order to pass the login
screen

:::important
Vite uses the default url `http://127.0.0.1:5173` for the development server.
Firebase Auth will require to add this url to the authorized domains in the
Firebase console.
Alternatively, you can use the url `http://localhost:5173`.
:::

![firebase_setup](/img/firebase_setup_auth.png)

### Storage

In case you want to use the different storage fields provided by the CMS, you
need to enable **Firebase Storage**. The default bucket will be used to
save your stored files.

:::note
If you are experiencing any CORS issues, you can enable CORS in your bucket
settings as specified in: https://firebase.google.com/docs/storage/web/download-files#cors_configuration
Create a file with the content:

```
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

and upload it with: `gsutil cors set cors.json gs://<your-cloud-storage-bucket>`.
:::
