---
slug: "docs/api/type-aliases/NavigationController"
title: "NavigationController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / NavigationController

# ~~Type Alias: NavigationController\<EC\>~~

> **NavigationController**\<`EC`\> = [`CMSUrlController`](CMSUrlController) & [`NavigationStateController`](NavigationStateController) & [`CollectionRegistryController`](CollectionRegistryController)\<`EC`\>

Defined in: [types/src/controllers/navigation.ts:178](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Legacy monolithic controller that includes the resolved navigation and utility methods and attributes.
It is a combination of CMSUrlController, NavigationStateController, and CollectionRegistryController.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection) = [`EntityCollection`](../interfaces/EntityCollection)\<`any`\>

## Deprecated

Use the specific controllers instead.
