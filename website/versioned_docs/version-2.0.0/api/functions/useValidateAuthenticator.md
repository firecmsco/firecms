---
id: "useValidateAuthenticator"
title: "Function: useValidateAuthenticator"
sidebar_label: "useValidateAuthenticator"
sidebar_position: 0
custom_edit_url: null
---

▸ **useValidateAuthenticator**<`UserType`\>(`«destructured»`): `Object`

This hook is used internally for validating an authenticator.
You may want to use it if you are not using [FirebaseCMSApp](FirebaseCMSApp.md), but
building your own custom [FireCMS](FireCMS.md) instance.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `appCheckForceRefresh?` | `boolean` |
| › `authController` | [`AuthController`](../types/AuthController.md)<`UserType`\> |
| › `authentication?` | `boolean` \| [`Authenticator`](../types/Authenticator.md)<`UserType`\> |
| › `dataSource` | [`DataSource`](../interfaces/DataSource.md) |
| › `getAppCheckToken?` | (`forceRefresh`: `boolean`) => `undefined` \| `Promise`<[`AppCheckTokenResult`](../interfaces/AppCheckTokenResult.md)\> |
| › `storageSource` | [`StorageSource`](../interfaces/StorageSource.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `authLoading` | `boolean` |
| `authVerified` | `boolean` |
| `canAccessMainView` | `boolean` |
| `notAllowedError` | `any` |

#### Defined in

[lib/src/firebase_app/hooks/useValidateAuthenticator.tsx:18](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/hooks/useValidateAuthenticator.tsx#L18)
