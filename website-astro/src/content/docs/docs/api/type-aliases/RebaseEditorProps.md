---
slug: "docs/api/type-aliases/RebaseEditorProps"
title: "RebaseEditorProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseEditorProps

# Type Alias: RebaseEditorProps

> **RebaseEditorProps** = `object`

Defined in: [core/src/editor/editor.tsx:30](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

## Properties

### aiController?

> `optional` **aiController**: [`EditorAIController`](EditorAIController)

Defined in: [core/src/editor/editor.tsx:39](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

***

### content?

> `optional` **content**: [`JSONContent`](JSONContent) \| `string`

Defined in: [core/src/editor/editor.tsx:31](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

***

### customComponents?

> `optional` **customComponents**: [`CustomEditorComponent`](CustomEditorComponent)[]

Defined in: [core/src/editor/editor.tsx:40](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/src/editor/editor.tsx:41](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

***

### handleImageUpload()

> **handleImageUpload**: (`file`) => `Promise`\<`string`\>

Defined in: [core/src/editor/editor.tsx:35](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`string`\>

***

### highlight?

> `optional` **highlight**: `object`

Defined in: [core/src/editor/editor.tsx:38](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

#### from

> **from**: `number`

#### to

> **to**: `number`

***

### markdownConfig?

> `optional` **markdownConfig**: [`MarkdownEditorConfig`](../interfaces/MarkdownEditorConfig)

Defined in: [core/src/editor/editor.tsx:42](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

***

### onHtmlContentChange()?

> `optional` **onHtmlContentChange**: (`content`) => `void`

Defined in: [core/src/editor/editor.tsx:34](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

#### Parameters

##### content

`string`

#### Returns

`void`

***

### onJsonContentChange()?

> `optional` **onJsonContentChange**: (`content`) => `void`

Defined in: [core/src/editor/editor.tsx:33](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

#### Parameters

##### content

[`JSONContent`](JSONContent) | `null`

#### Returns

`void`

***

### onMarkdownContentChange()?

> `optional` **onMarkdownContentChange**: (`content`) => `void`

Defined in: [core/src/editor/editor.tsx:32](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

#### Parameters

##### content

`string`

#### Returns

`void`

***

### textSize?

> `optional` **textSize**: [`RebaseEditorTextSize`](RebaseEditorTextSize)

Defined in: [core/src/editor/editor.tsx:37](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)

***

### version?

> `optional` **version**: `number`

Defined in: [core/src/editor/editor.tsx:36](https://github.com/rebaseco/rebase/blob/main/packages/core/src/editor/editor.tsx)
