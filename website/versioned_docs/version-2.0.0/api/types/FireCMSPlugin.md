---
id: "FireCMSPlugin"
title: "Type alias: FireCMSPlugin<PROPS, FORM_PROPS>"
sidebar_label: "FireCMSPlugin"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FireCMSPlugin**\<`PROPS`, `FORM_PROPS`\>: `Object`

Interface used to define plugins for FireCMS.
NOTE: This is a work in progress and the API is not stable yet.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `PROPS` | `any` |
| `FORM_PROPS` | `any` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `collectionView?` | \{ `AddColumnComponent?`: `React.ComponentType`\<\{ `collection`: [`EntityCollection`](../interfaces/EntityCollection.md) ; `fullPath`: `string` ; `parentPathSegments`: `string`[]  }\> ; `HeaderAction?`: `React.ComponentType`\<\{ `fullPath`: `string` ; `onHover`: `boolean` ; `parentPathSegments`: `string`[] ; `property`: [`ResolvedProperty`](ResolvedProperty.md) ; `propertyKey`: `string`  }\>  } | - |
| `collectionView.AddColumnComponent?` | `React.ComponentType`\<\{ `collection`: [`EntityCollection`](../interfaces/EntityCollection.md) ; `fullPath`: `string` ; `parentPathSegments`: `string`[]  }\> | If you add this callback to your plugin, an add button will be added to the collection table. TODO: Only the first plugin that defines this callback will be used, at the moment. |
| `collectionView.HeaderAction?` | `React.ComponentType`\<\{ `fullPath`: `string` ; `onHover`: `boolean` ; `parentPathSegments`: `string`[] ; `property`: [`ResolvedProperty`](ResolvedProperty.md) ; `propertyKey`: `string`  }\> | Use this method to inject widgets to the entity collections header **`Param`** |
| `collections?` | \{ `CollectionActions?`: `React.ComponentType`\<[`CollectionActionsProps`](../interfaces/CollectionActionsProps.md)\> \| `React.ComponentType`\<[`CollectionActionsProps`](../interfaces/CollectionActionsProps.md)\>[] ; `injectCollections?`: (`collections`: [`EntityCollection`](../interfaces/EntityCollection.md)[]) => [`EntityCollection`](../interfaces/EntityCollection.md)[]  } | - |
| `collections.CollectionActions?` | `React.ComponentType`\<[`CollectionActionsProps`](../interfaces/CollectionActionsProps.md)\> \| `React.ComponentType`\<[`CollectionActionsProps`](../interfaces/CollectionActionsProps.md)\>[] | Use this component to add custom actions to the entity collections toolbar. |
| `collections.injectCollections?` | (`collections`: [`EntityCollection`](../interfaces/EntityCollection.md)[]) => [`EntityCollection`](../interfaces/EntityCollection.md)[] | Use this method to inject collections to the CMS. You receive the current collections as a parameter, and you can return a new list of collections. **`See`** joinCollectionLists |
| `form?` | \{ `Actions?`: `React.ComponentType`\<[`PluginFormActionProps`](../interfaces/PluginFormActionProps.md)\> ; `fieldBuilder?`: \<T\>(`props`: [`PluginFieldBuilderParams`](PluginFieldBuilderParams.md)\<`T`\>) => `React.ComponentType`\<[`FieldProps`](../interfaces/FieldProps.md)\<`T`\>\> \| ``null`` ; `fieldBuilderEnabled?`: \<T\>(`props`: [`PluginFieldBuilderParams`](PluginFieldBuilderParams.md)\<`T`\>) => `boolean` ; `provider?`: \{ `Component`: `React.ComponentType`\<`PropsWithChildren`\<`FORM_PROPS` & [`PluginFormActionProps`](../interfaces/PluginFormActionProps.md)\<`any`\>\>\> ; `props?`: `FORM_PROPS`  }  } | - |
| `form.Actions?` | `React.ComponentType`\<[`PluginFormActionProps`](../interfaces/PluginFormActionProps.md)\> | - |
| `form.fieldBuilder?` | \<T\>(`props`: [`PluginFieldBuilderParams`](PluginFieldBuilderParams.md)\<`T`\>) => `React.ComponentType`\<[`FieldProps`](../interfaces/FieldProps.md)\<`T`\>\> \| ``null`` | - |
| `form.fieldBuilderEnabled?` | \<T\>(`props`: [`PluginFieldBuilderParams`](PluginFieldBuilderParams.md)\<`T`\>) => `boolean` | - |
| `form.provider?` | \{ `Component`: `React.ComponentType`\<`PropsWithChildren`\<`FORM_PROPS` & [`PluginFormActionProps`](../interfaces/PluginFormActionProps.md)\<`any`\>\>\> ; `props?`: `FORM_PROPS`  } | - |
| `form.provider.Component` | `React.ComponentType`\<`PropsWithChildren`\<`FORM_PROPS` & [`PluginFormActionProps`](../interfaces/PluginFormActionProps.md)\<`any`\>\>\> | - |
| `form.provider.props?` | `FORM_PROPS` | - |
| `homePage?` | \{ `AdditionalCards?`: `React.ComponentType`\<[`PluginHomePageAdditionalCardsProps`](../interfaces/PluginHomePageAdditionalCardsProps.md)\> \| `React.ComponentType`\<[`PluginHomePageAdditionalCardsProps`](../interfaces/PluginHomePageAdditionalCardsProps.md)\>[] ; `CollectionActions?`: `React.ComponentType`\<[`PluginHomePageActionsProps`](../interfaces/PluginHomePageActionsProps.md)\> ; `additionalChildrenStart?`: `React.ReactNode` ; `extraProps?`: `any` ; `includeSection?`: (`props`: [`PluginGenericProps`](../interfaces/PluginGenericProps.md)) => \{ `children`: `React.ReactNode` ; `title`: `string`  }  } | - |
| `homePage.AdditionalCards?` | `React.ComponentType`\<[`PluginHomePageAdditionalCardsProps`](../interfaces/PluginHomePageAdditionalCardsProps.md)\> \| `React.ComponentType`\<[`PluginHomePageAdditionalCardsProps`](../interfaces/PluginHomePageAdditionalCardsProps.md)\>[] | Add additional cards to each collection group in the home page. |
| `homePage.CollectionActions?` | `React.ComponentType`\<[`PluginHomePageActionsProps`](../interfaces/PluginHomePageActionsProps.md)\> | Use this component to add custom actions to the navigation card in the home page. |
| `homePage.additionalChildrenStart?` | `React.ReactNode` | - |
| `homePage.extraProps?` | `any` | Additional props passed to `CollectionActions` |
| `homePage.includeSection?` | (`props`: [`PluginGenericProps`](../interfaces/PluginGenericProps.md)) => \{ `children`: `React.ReactNode` ; `title`: `string`  } | Include a section in the home page with a custom component and title. |
| `loading?` | `boolean` | If this flag is set to true, no content will be shown in the CMS until the plugin is fully loaded. |
| `name` | `string` | Name of the plugin |
| `provider?` | \{ `Component`: `React.ComponentType`\<`PropsWithChildren`\<`PROPS` & \{ `context`: [`FireCMSContext`](FireCMSContext.md)  }\>\> ; `props?`: `PROPS`  } | You can use this prop to add higher order components to the CMS. The components will be added to the root of the CMS, so any component rendered underneath by this plugin will have access to the context provided by this HOC. Anyhow, this is rendered below the [FireCMSContext](FireCMSContext.md) provider, so you can use the hooks provided by the CMS. **`Param`** |
| `provider.Component` | `React.ComponentType`\<`PropsWithChildren`\<`PROPS` & \{ `context`: [`FireCMSContext`](FireCMSContext.md)  }\>\> | - |
| `provider.props?` | `PROPS` | - |

#### Defined in

[packages/firecms_core/src/types/plugins.tsx:16](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/plugins.tsx#L16)
