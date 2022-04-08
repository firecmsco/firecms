---
id: "useInitialiseFirebase"
title: "Function: useInitialiseFirebase"
sidebar_label: "useInitialiseFirebase"
sidebar_position: 0
custom_edit_url: null
---

▸ **useInitialiseFirebase**(`__namedParameters`): [`InitialiseFirebaseResult`](../interfaces/InitialiseFirebaseResult)

Function used to initialise Firebase, either by using the provided config,
or by fetching it by Firebase Hosting, if not specified.

It works as a hook that gives you the loading state and the used
configuration.

You most likely only need to use this if you are developing a custom app
that is not using [FirebaseCMSApp](FirebaseCMSApp). You can also not use this component
and initialise Firebase yourself.

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.firebaseConfig` | `undefined` \| `Object` |
| `__namedParameters.onFirebaseInit?` | (`config`: `object`) => `void` |

#### Returns

[`InitialiseFirebaseResult`](../interfaces/InitialiseFirebaseResult)

#### Defined in

[firebase_app/hooks/useInitialiseFirebase.ts:30](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/hooks/useInitialiseFirebase.ts#L30)
