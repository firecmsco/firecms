# @firecms/explorer

Schema-less Firestore data inspection and manipulation for FireCMS SaaS.

## Overview

Explorer is a powerful feature for FireCMS Cloud Plus and Pro subscribers that enables browsing, visualizing, and editing Firestore collections without predefined schemas. It automatically infers field types and structure from your data, providing a Firefoo/Fuego-like experience while maintaining FireCMS's architectural advantages.

## Features

- **Schema-less Browsing**: Inspect any Firestore collection without configuration
- **Auto-Inferred Columns**: Dynamically generates table columns from document data
- **Dual View Modes**: Switch between table view and raw JSON view
- **Inline Editing**: Edit document fields directly in the table
- **Type Detection**: Automatically infers and displays data types
- **Sparse Field Visualization**: Identifies and highlights fields that don't appear in all documents
- **Search & Filter**: Quickly find documents with global search
- **CRUD Operations**: Create, read, update, and delete documents
- **Nested Data Support**: Handles nested objects and arrays with dot notation

## Installation

```bash
npm install @firecms/explorer
# or
yarn add @firecms/explorer
```

## Usage

### Basic Setup

```typescript
import { ExplorerPlugin } from '@firecms/explorer';

// In your FireCMS configuration
<ExplorerPlugin subscriptionTier="cloud_plus" />
```

### With FireCMS Cloud Projects API

To get access to ALL root collections in Firestore (not just configured ones), pass the projects API:

```typescript
import { ExplorerPlugin } from '@firecms/explorer';
import { buildProjectsApi } from '@firecms/cloud';

const projectsApi = buildProjectsApi(host, getBackendAuthToken);

<ExplorerPlugin 
  subscriptionTier="cloud_plus"
  projectsApi={projectsApi}
  projectId="your-project-id"
/>
```

### Subscription Tiers

Explorer is available for:
- Cloud Plus
- Pro
- Enterprise

Free tier users will see an upgrade prompt.

## Components

### ExplorerPlugin

Main plugin component that handles subscription verification and renders the Explorer view.

```typescript
<ExplorerPlugin subscriptionTier={userSubscriptionTier} />
```

### ExplorerView

The main Explorer interface. Can be used standalone if you want to embed it in a custom layout.

```typescript
import { ExplorerView } from '@firecms/explorer';

<ExplorerView />
```

## Hooks

### useRootCollections

Fetches and caches root collections from the navigation controller.

```typescript
const { collections, loading, error } = useRootCollections();
```

### useCollectionData

Fetches and manages collection documents with pagination.

```typescript
const {
  documents,
  loading,
  error,
  hasMore,
  fetchMore,
  refresh
} = useCollectionData({ collectionPath: 'users', limit: 50 });
```

### useFieldAnalysis

Analyzes documents to discover fields and infer types.

```typescript
const schema = useFieldAnalysis(documents);
```

### useDocumentMutation

Provides CRUD operations for documents.

```typescript
const {
  updateField,
  updateDocument,
  createDocument,
  deleteDocument,
  loading,
  error
} = useDocumentMutation();
```

### useSubscriptionCheck

Verifies subscription access to Explorer.

```typescript
const { hasAccess, subscriptionTier } = useSubscriptionCheck({
  subscriptionTier: 'cloud_plus'
});
```

## Services

### CollectionDiscovery

Discovers root collections from the navigation controller.

```typescript
import { createCollectionDiscovery } from '@firecms/explorer';

const discovery = createCollectionDiscovery(navigationController);
const collections = await discovery.getRootCollections();
```

### DataFetcher

Fetches documents from Firestore collections.

```typescript
import { createDataFetcher } from '@firecms/explorer';

const fetcher = createDataFetcher(dataSource, 20);
const documents = await fetcher.fetchCollection('users');
```

### FieldAnalyzer

Analyzes documents to discover fields and infer types.

```typescript
import { createFieldAnalyzer } from '@firecms/explorer';

const analyzer = createFieldAnalyzer();
const schema = analyzer.analyzeDocuments(documents);
```

### DocumentMutationService

Handles document CRUD operations.

```typescript
import { createDocumentMutationService } from '@firecms/explorer';

const mutationService = createDocumentMutationService(dataSource);
await mutationService.updateField('users/123', 'name', 'John Doe');
```

## Types

```typescript
import type {
  DataType,
  ViewMode,
  SubscriptionTier,
  InferredField,
  InferredSchema,
  DocumentData,
  FilterState
} from '@firecms/explorer';
```

## Development

### Building

```bash
yarn build
```

### Testing

```bash
yarn test
```

### Development Mode

```bash
yarn dev
```

## License

MIT

## Support

For issues and feature requests, please visit the [FireCMS GitHub repository](https://github.com/firecmsco/firecms).
