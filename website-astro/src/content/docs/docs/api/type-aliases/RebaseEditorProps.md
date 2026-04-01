---
slug: "docs/api/type-aliases/RebaseEditorProps"
title: "RebaseEditorProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseEditorProps

# Type Alias: RebaseEditorProps

> **RebaseEditorProps** = `object`

Defined in: core/src/editor/editor.tsx:30

## Properties

### aiController?

> `optional` **aiController**: [`EditorAIController`](EditorAIController)

Defined in: core/src/editor/editor.tsx:39

***

### content?

> `optional` **content**: [`JSONContent`](JSONContent) \| `string`

Defined in: core/src/editor/editor.tsx:31

***

### customComponents?

> `optional` **customComponents**: [`CustomEditorComponent`](CustomEditorComponent)[]

Defined in: core/src/editor/editor.tsx:40

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: core/src/editor/editor.tsx:41

***

### handleImageUpload()

> **handleImageUpload**: (`file`) => `Promise`\<`string`\>

Defined in: core/src/editor/editor.tsx:35

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`string`\>

***

### highlight?

> `optional` **highlight**: `object`

Defined in: core/src/editor/editor.tsx:38

#### from

> **from**: `number`

#### to

> **to**: `number`

***

### markdownConfig?

> `optional` **markdownConfig**: [`MarkdownEditorConfig`](../interfaces/MarkdownEditorConfig)

Defined in: core/src/editor/editor.tsx:42

***

### onHtmlContentChange()?

> `optional` **onHtmlContentChange**: (`content`) => `void`

Defined in: core/src/editor/editor.tsx:34

#### Parameters

##### content

`string`

#### Returns

`void`

***

### onJsonContentChange()?

> `optional` **onJsonContentChange**: (`content`) => `void`

Defined in: core/src/editor/editor.tsx:33

#### Parameters

##### content

[`JSONContent`](JSONContent) | `null`

#### Returns

`void`

***

### onMarkdownContentChange()?

> `optional` **onMarkdownContentChange**: (`content`) => `void`

Defined in: core/src/editor/editor.tsx:32

#### Parameters

##### content

`string`

#### Returns

`void`

***

### textSize?

> `optional` **textSize**: [`RebaseEditorTextSize`](RebaseEditorTextSize)

Defined in: core/src/editor/editor.tsx:37

***

### version?

> `optional` **version**: `number`

Defined in: core/src/editor/editor.tsx:36
