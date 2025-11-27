---
slug: "docs/api/classes/ErrorBoundary"
title: "ErrorBoundary"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / ErrorBoundary

# Class: ErrorBoundary

Defined in: [components/ErrorBoundary.tsx:5](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ErrorBoundary.tsx)

## Extends

- `Component`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>, \{ `error`: `Error` \| `null`; \}\>

## Constructors

### Constructor

> **new ErrorBoundary**(`props`): `ErrorBoundary`

Defined in: [components/ErrorBoundary.tsx:8](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ErrorBoundary.tsx)

#### Parameters

##### props

`any`

#### Returns

`ErrorBoundary`

#### Overrides

React.Component\<PropsWithChildren\<Record\<string, unknown\>\>, \{ error: Error \| null \}\>.constructor

## Methods

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [components/ErrorBoundary.tsx:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ErrorBoundary.tsx)

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

##### error

`Error`

##### errorInfo

`ErrorInfo`

#### Returns

`void`

#### Overrides

`React.Component.componentDidCatch`

***

### render()

> **render**(): `string` \| `number` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Element` \| `null` \| `undefined`

Defined in: [components/ErrorBoundary.tsx:23](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ErrorBoundary.tsx)

#### Returns

`string` \| `number` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Element` \| `null` \| `undefined`

#### Overrides

`React.Component.render`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): `object`

Defined in: [components/ErrorBoundary.tsx:14](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ErrorBoundary.tsx)

#### Parameters

##### error

`Error`

#### Returns

`object`

##### error

> **error**: `Error`
