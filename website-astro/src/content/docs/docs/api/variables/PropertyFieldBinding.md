---
slug: "docs/api/variables/PropertyFieldBinding"
title: "PropertyFieldBinding"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PropertyFieldBinding

# Variable: PropertyFieldBinding()

> `const` **PropertyFieldBinding**: \<`M`\>(`propertyKey`) => `ReactElement`\<[`PropertyFieldBindingProps`](../interfaces/PropertyFieldBindingProps)\<`M`\>\>

Defined in: [core/src/form/PropertyFieldBinding.tsx:47](https://github.com/rebasepro/rebase/blob/main/packages/core/src/form/PropertyFieldBinding.tsx)

This component renders a form field creating the corresponding configuration
from a property. For example if bound to a string property, it will generate
a text field.

You can use it when you are creating a custom field, and need to
render additional fields mapped to properties. This is useful if you
need to build a complex property mapping, like an array where each index
is a different property.

Please note that if you build a custom field in a component, the
**validation** passed in the property will have no effect. You need to set
the validation in the `EntityCollection` definition.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Parameters

### propertyKey

[`PropertyFieldBindingProps`](../interfaces/PropertyFieldBindingProps)\<`M`\>

You can use nested names such as `address.street` or `friends[2]`

## Returns

`ReactElement`\<[`PropertyFieldBindingProps`](../interfaces/PropertyFieldBindingProps)\<`M`\>\>
