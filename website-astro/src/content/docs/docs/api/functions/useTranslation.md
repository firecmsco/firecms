---
slug: "docs/api/functions/useTranslation"
title: "useTranslation"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useTranslation

# Function: useTranslation()

> **useTranslation**(): `object`

Defined in: [core/src/hooks/useTranslation.ts:18](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/useTranslation.ts)

**`Internal`**

Internal hook for translating FireCMS UI strings.

Uses the `rebase_core` i18next namespace that is initialised by
`RebaseI18nProvider`. Do NOT use `react-i18next` directly in internal
components — always go through this hook so the namespace is consistent.

## Returns

### i18n

> **i18n**: `i18n`

### t()

> **t**: (`key`, `vars?`) => `string` = `typedT`

Typed translation function scoped to FirecmsTranslations keys.
Also supports i18next interpolation variables, e.g.
  t("add_to_field", { fieldName: "Tags" })
  t("error_deleting", { message: err.message })

#### Parameters

##### key

`string`

##### vars?

`Record`\<`string`, `string`\>

#### Returns

`string`

## Example

```ts
const { t } = useTranslation();
<Button>{t("save")}</Button>

@internal
```
