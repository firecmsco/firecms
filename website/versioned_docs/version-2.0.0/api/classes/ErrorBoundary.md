---
id: "ErrorBoundary"
title: "Class: ErrorBoundary"
sidebar_label: "ErrorBoundary"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `Component`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>, \{ `error`: `Error` \| ``null``  }\>

  ↳ **`ErrorBoundary`**

## Constructors

### constructor

• **new ErrorBoundary**(`props`): [`ErrorBoundary`](ErrorBoundary.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `any` |

#### Returns

[`ErrorBoundary`](ErrorBoundary.md)

#### Overrides

React.Component\&lt;PropsWithChildren\&lt;Record\&lt;string, unknown\&gt;\&gt;, \{
    error: Error \| null
}\&gt;.constructor

#### Defined in

[packages/firecms_core/src/core/components/ErrorBoundary.tsx:9](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ErrorBoundary.tsx#L9)

## Properties

### context

• **context**: `unknown`

If using the new style context, re-declare this in your class to be the
`React.ContextType` of your `static contextType`.
Should be used with type annotation or static contextType.

```ts
static contextType = MyContext
// For TS pre-3.7:
context!: React.ContextType<typeof MyContext>
// For TS 3.7 and above:
declare context: React.ContextType<typeof MyContext>
```

**`See`**

https://react.dev/reference/react/Component#context

#### Inherited from

React.Component.context

#### Defined in

node_modules/@types/react/index.d.ts:517

___

### props

• `Readonly` **props**: `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\>

#### Inherited from

React.Component.props

#### Defined in

node_modules/@types/react/index.d.ts:537

___

### refs

• **refs**: `Object`

**`Deprecated`**

https://legacy.reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

#### Index signature

▪ [key: `string`]: `ReactInstance`

#### Inherited from

React.Component.refs

#### Defined in

node_modules/@types/react/index.d.ts:543

___

### state

• **state**: `Readonly`\<\{ `error`: ``null`` \| `Error`  }\>

#### Inherited from

React.Component.state

#### Defined in

node_modules/@types/react/index.d.ts:538

___

### contextType

▪ `Static` `Optional` **contextType**: `Context`\<`any`\>

If set, `this.context` will be set at runtime to the current value of the given Context.

Usage:

```ts
type MyContext = number
const Ctx = React.createContext<MyContext>(0)

class Foo extends React.Component {
  static contextType = Ctx
  context!: React.ContextType<typeof Ctx>
  render () {
    return <>My context's value: {this.context}</>;
  }
}
```

**`See`**

https://react.dev/reference/react/Component#static-contexttype

#### Inherited from

React.Component.contextType

#### Defined in

node_modules/@types/react/index.d.ts:500

## Methods

### UNSAFE\_componentWillMount

▸ **UNSAFE_componentWillMount**(): `void`

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

#### Returns

`void`

**`Deprecated`**

16.3, use componentDidMount or the constructor instead

**`See`**

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Inherited from

React.Component.UNSAFE\_componentWillMount

#### Defined in

node_modules/@types/react/index.d.ts:734

___

### UNSAFE\_componentWillReceiveProps

▸ **UNSAFE_componentWillReceiveProps**(`nextProps`, `nextContext`): `void`

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\> |
| `nextContext` | `any` |

#### Returns

`void`

**`Deprecated`**

16.3, use static getDerivedStateFromProps instead

**`See`**

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Inherited from

React.Component.UNSAFE\_componentWillReceiveProps

#### Defined in

node_modules/@types/react/index.d.ts:766

___

### UNSAFE\_componentWillUpdate

▸ **UNSAFE_componentWillUpdate**(`nextProps`, `nextState`, `nextContext`): `void`

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\> |
| `nextState` | `Readonly`\<\{ `error`: ``null`` \| `Error`  }\> |
| `nextContext` | `any` |

#### Returns

`void`

**`Deprecated`**

16.3, use getSnapshotBeforeUpdate instead

**`See`**

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Inherited from

React.Component.UNSAFE\_componentWillUpdate

#### Defined in

node_modules/@types/react/index.d.ts:794

___

### componentDidCatch

▸ **componentDidCatch**(`error`, `errorInfo`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |
| `errorInfo` | `ErrorInfo` |

#### Returns

`void`

#### Overrides

React.Component.componentDidCatch

#### Defined in

[packages/firecms_core/src/core/components/ErrorBoundary.tsx:19](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ErrorBoundary.tsx#L19)

___

### componentDidMount

▸ **componentDidMount**(): `void`

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

#### Returns

`void`

#### Inherited from

React.Component.componentDidMount

#### Defined in

node_modules/@types/react/index.d.ts:642

___

### componentDidUpdate

▸ **componentDidUpdate**(`prevProps`, `prevState`, `snapshot?`): `void`

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters

| Name | Type |
| :------ | :------ |
| `prevProps` | `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\> |
| `prevState` | `Readonly`\<\{ `error`: ``null`` \| `Error`  }\> |
| `snapshot?` | `any` |

#### Returns

`void`

#### Inherited from

React.Component.componentDidUpdate

#### Defined in

node_modules/@types/react/index.d.ts:705

___

### componentWillMount

▸ **componentWillMount**(): `void`

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

#### Returns

`void`

**`Deprecated`**

16.3, use componentDidMount or the constructor instead; will stop working in React 17

**`See`**

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Inherited from

React.Component.componentWillMount

#### Defined in

node_modules/@types/react/index.d.ts:720

___

### componentWillReceiveProps

▸ **componentWillReceiveProps**(`nextProps`, `nextContext`): `void`

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\> |
| `nextContext` | `any` |

#### Returns

`void`

**`Deprecated`**

16.3, use static getDerivedStateFromProps instead; will stop working in React 17

**`See`**

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Inherited from

React.Component.componentWillReceiveProps

#### Defined in

node_modules/@types/react/index.d.ts:749

___

### componentWillUnmount

▸ **componentWillUnmount**(): `void`

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

#### Returns

`void`

#### Inherited from

React.Component.componentWillUnmount

#### Defined in

node_modules/@types/react/index.d.ts:658

___

### componentWillUpdate

▸ **componentWillUpdate**(`nextProps`, `nextState`, `nextContext`): `void`

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\> |
| `nextState` | `Readonly`\<\{ `error`: ``null`` \| `Error`  }\> |
| `nextContext` | `any` |

#### Returns

`void`

**`Deprecated`**

16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

**`See`**

 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
 - https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Inherited from

React.Component.componentWillUpdate

#### Defined in

node_modules/@types/react/index.d.ts:779

___

### forceUpdate

▸ **forceUpdate**(`callback?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | () => `void` |

#### Returns

`void`

#### Inherited from

React.Component.forceUpdate

#### Defined in

node_modules/@types/react/index.d.ts:534

___

### getSnapshotBeforeUpdate

▸ **getSnapshotBeforeUpdate**(`prevProps`, `prevState`): `any`

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters

| Name | Type |
| :------ | :------ |
| `prevProps` | `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\> |
| `prevState` | `Readonly`\<\{ `error`: ``null`` \| `Error`  }\> |

#### Returns

`any`

#### Inherited from

React.Component.getSnapshotBeforeUpdate

#### Defined in

node_modules/@types/react/index.d.ts:699

___

### render

▸ **render**(): `undefined` \| ``null`` \| `string` \| `number` \| `boolean` \| `Iterable`\<`ReactNode`\> \| `Element`

#### Returns

`undefined` \| ``null`` \| `string` \| `number` \| `boolean` \| `Iterable`\<`ReactNode`\> \| `Element`

#### Overrides

React.Component.render

#### Defined in

[packages/firecms_core/src/core/components/ErrorBoundary.tsx:24](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ErrorBoundary.tsx#L24)

___

### setState

▸ **setState**\<`K`\>(`state`, `callback?`): `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends ``"error"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | ``null`` \| \{ `error`: ``null`` \| `Error`  } \| (`prevState`: `Readonly`\<\{ `error`: ``null`` \| `Error`  }\>, `props`: `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\>) => ``null`` \| \{ `error`: ``null`` \| `Error`  } \| `Pick`\<\{ `error`: ``null`` \| `Error`  }, `K`\> \| `Pick`\<\{ `error`: ``null`` \| `Error`  }, `K`\> |
| `callback?` | () => `void` |

#### Returns

`void`

#### Inherited from

React.Component.setState

#### Defined in

node_modules/@types/react/index.d.ts:529

___

### shouldComponentUpdate

▸ **shouldComponentUpdate**(`nextProps`, `nextState`, `nextContext`): `boolean`

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nextProps` | `Readonly`\<`PropsWithChildren`\<`Record`\<`string`, `unknown`\>\>\> |
| `nextState` | `Readonly`\<\{ `error`: ``null`` \| `Error`  }\> |
| `nextContext` | `any` |

#### Returns

`boolean`

#### Inherited from

React.Component.shouldComponentUpdate

#### Defined in

node_modules/@types/react/index.d.ts:653

___

### getDerivedStateFromError

▸ **getDerivedStateFromError**(`error`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

#### Defined in

[packages/firecms_core/src/core/components/ErrorBoundary.tsx:15](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/ErrorBoundary.tsx#L15)
