---
id: "useInitialiseFirebase"
title: "Function: useInitialiseFirebase"
sidebar_label: "useInitialiseFirebase"
sidebar_position: 0
custom_edit_url: null
---

▸ **useInitialiseFirebase**(`«destructured»`): [`InitialiseFirebaseResult`](../interfaces/InitialiseFirebaseResult.md)

Function used to initialise Firebase, either by using the provided config,
or by fetching it by Firebase Hosting, if not specified.

It works as a hook that gives you the loading state and the used
configuration.

You most likely only need to use this if you are developing a custom app
that is not using [FirebaseCMSApp](FirebaseCMSApp.md). You can also not use this component
and initialise Firebase yourself.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `authDomain?` | `string` |
| › `firebaseConfig` | `undefined` \| `Record`<`string`, `unknown`\> |
| › `name?` | `string` |
| › `onFirebaseInit?` | (`config`: `object`, `firebaseApp`: `FirebaseApp`) => `void` |

#### Returns

[`InitialiseFirebaseResult`](../interfaces/InitialiseFirebaseResult.md)

#### Defined in

[lib/src/firebase_app/hooks/useInitialiseFirebase.ts:36](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/hooks/useInitialiseFirebase.ts#L36)
