---
id: firebase_setup
title: Firebase setup
sidebar_label: Firebase setup
---

In order to run **FireCMS**, you need to create a Firebase project first, with
some requirements:

### Firestore
You need to enable **Firestore** in it. You can initialise the security rules
in test mode to allow reads and writes, but you are encouraged to write rules
that are suited for your domain.

### Web app
In the project settings, you need to create a **Web app** within your
project, from which you can get your Firebase config as a Javascript object.
That is the object that you need to pass to the CMS.

![firebase_setup](/img/firebase_setup_app.png)

:::tip Firebase Hosting
Note that you can also link your new webapp to **Firebase Hosting** which will
allow you to deploy it with very little effort. You can create the
Firebase Hosting site at a later stage and link it to your webapp.
:::

### Authentication
You will most likely want to enable authentication in order to pass the login
screen

![firebase_setup](/img/firebase_setup_auth.png)


### Storage

In case you want to use the different storage fields provided by the CMS, you
need to enable **Firebase Storage**. The default bucket will be used to
save your stored files.

### Firebase Emulator

Use the firebase emulator with `onFirebaseInit`:

```
  const onFirebaseInit = async () => {
    if (process.env.NODE_ENV === 'development') {
      const db = getFirestore();
      const auth = getAuth();

      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    }
  };
```

```
   <FirebaseCMSApp
      name={'Demo App'}
      authentication={myAuthenticator}
      collections={[eventsCollection, usersCollection]}
      firebaseConfig={firebaseConfig}
      onFirebaseInit={onFirebaseInit}
      dateTimeFormat="E d LLL y"
      signInOptions={[
        {
          provider: 'facebook.com',
        },
      ]}
    />
```
