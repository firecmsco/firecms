---
slug: docs/firestore_rules
title: Firestore Rules
sidebar_label: Firestore Rules
---

:::note
These rules apply specifically to the FireCMS PRO plugins configuration. If you are using the community version
you are encouraged to write your own rules to secure your data.
:::

FireCMS PRO saves some configuration data in Firestore to manage user roles and permissions, as well as the
collections configuration. In order to work properly, you need to set up the Firestore rules to allow
the plugin to read and write to the specified paths.

These are the default paths used by FireCMS (you can modify those paths in the specific plugin configuration):

- `__FIRECMS/config/users`
- `__FIRECMS/config/roles`
- `__FIRECMS/config/collections`

### First time setup rules

Depending on your project setup, the logged in user might not have permission to write to the Firestore database,
in the FireCMS config path. In this case we suggest temporarily allowing access to the `__FIRECMS` path and
subcollections.

```
match /__FIRECMS/{document=**} {
  allow read: if true;
  allow write: if true;
}
```

### Final suggested rules

After you have created the first user and roles, you can restrict access to the `__FIRECMS` path again.
We encourage you to set-up specific rules for your project, based on your security requirements.

These are the rules that we suggest:

```
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/users/$(request.auth.token.email));
}
```

These rules will allow users that have a CMS role to read and write all the data in your Firestore database.
The roles will be enforced in the frontend by FireCMS, but if it is a requirement for your project, you can also
enforce them in the Firestore rules, by setting your own custom rules.

