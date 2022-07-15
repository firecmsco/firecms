---
id: "FirebaseCMSApp"
title: "Function: FirebaseCMSApp"
sidebar_label: "FirebaseCMSApp"
sidebar_position: 0
custom_edit_url: null
---

▸ **FirebaseCMSApp**(`props`): `Element`

This is the default implementation of a FireCMS app using the Firebase services
as a backend.
You can use this component as a full app, by specifying collections and
entity schemas.

This component is in charge of initialising Firebase, with the given
configuration object.

If you are building a larger app and need finer control, you can use
[FireCMS](FireCMS), [Scaffold](Scaffold), [SideEntityDialogs](SideEntityDialogs)
and [NavigationRoutes](NavigationRoutes) instead.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`FirebaseCMSAppProps`](../interfaces/FirebaseCMSAppProps) |

#### Returns

`Element`

#### Defined in

[firebase_app/FirebaseCMSApp.tsx:45](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSApp.tsx#L45)
