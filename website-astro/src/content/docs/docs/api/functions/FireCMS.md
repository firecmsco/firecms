---
slug: "docs/api/functions/FireCMS"
title: "FireCMS"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / FireCMS

# Function: FireCMS()

> **FireCMS**\<`USER`\>(`props`): `Element`

Defined in: [core/FireCMS.tsx:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/core/FireCMS.tsx)

If you are using independent components of the CMS
you need to wrap them with this main component, so the internal hooks work.

This is the main component of FireCMS. It acts as the provider of all the
internal contexts and hooks.

You only need to use this component if you are building a custom app.

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### props

[`FireCMSProps`](../type-aliases/FireCMSProps)\<`USER`\>

## Returns

`Element`
