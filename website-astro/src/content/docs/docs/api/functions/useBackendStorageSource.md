---
slug: "docs/api/functions/useBackendStorageSource"
title: "useBackendStorageSource"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useBackendStorageSource

# Function: useBackendStorageSource()

> **useBackendStorageSource**(`__namedParameters`): [`StorageSource`](../interfaces/StorageSource)

Defined in: [core/src/hooks/useBackendStorageSource.ts:40](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBackendStorageSource.ts)

Hook to create a StorageSource that uses the backend storage REST API.
Use this for self-hosted Rebase with local or S3 storage.

## Parameters

### \_\_namedParameters

[`BackendStorageSourceProps`](../interfaces/BackendStorageSourceProps)

## Returns

[`StorageSource`](../interfaces/StorageSource)

## Example

```tsx
const storageSource = useBackendStorageSource({
    apiUrl: 'http://localhost:3001',
    getAuthToken: authController.getAuthToken
});

// Then pass to Rebase:
<Rebase storageSource={storageSource} ... />
```
