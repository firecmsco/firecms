---
slug: "docs/api/interfaces/RebaseI18nProviderProps"
title: "RebaseI18nProviderProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseI18nProviderProps

# Interface: RebaseI18nProviderProps

Defined in: core/src/i18n/RebaseI18nProvider.tsx:22

## Properties

### locale?

> `optional` **locale**: `string`

Defined in: core/src/i18n/RebaseI18nProvider.tsx:24

BCP-47 locale tag, e.g. "en", "es", "fr". Defaults to "en".

***

### translations?

> `optional` **translations**: `object`

Defined in: core/src/i18n/RebaseI18nProvider.tsx:34

Override or extend any FireCMS UI string, keyed by locale.

#### Index Signature

\[`locale`: `string`\]: `object`

#### Example

```ts
translations={{
  en: { save: "Publish" },
  es: { save: "Publicar", discard: "Descartar" }
}}
```
