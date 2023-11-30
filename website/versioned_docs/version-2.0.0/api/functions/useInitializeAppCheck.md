---
id: "useInitializeAppCheck"
title: "Function: useInitializeAppCheck"
sidebar_label: "useInitializeAppCheck"
sidebar_position: 0
custom_edit_url: null
---

▸ **useInitializeAppCheck**(`firebaseApp`): `InitializeAppCheckResult`

Function used to initialise Firebase App Check.

It works as a hook that gives you back an object holding the Firebase App.

You most likely only need to use this if you are developing a custom app
that is not using [FirebaseCMSApp](FirebaseCMSApp.md). You can also not use this component
and initialise App Check yourself.

#### Parameters

| Name | Type |
| :------ | :------ |
| `firebaseApp` | `InitializeAppCheckProps` |

#### Returns

`InitializeAppCheckResult`

#### Defined in

[lib/src/firebase_app/hooks/useInitializeAppCheck.ts:38](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/hooks/useInitializeAppCheck.ts#L38)
