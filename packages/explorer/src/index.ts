// Main plugin export
export { ExplorerPlugin } from "./ExplorerPlugin";

// Component exports
export { ExplorerView } from "./components/ExplorerView";
export { TableView } from "./components/TableView";
export { JsonView } from "./components/JsonView";
export { TypeIndicator } from "./components/TypeIndicator";
export { ColumnHeader } from "./components/ColumnHeader";
export { EditableCell } from "./components/EditableCell";
export { ViewToggle } from "./components/ViewToggle";
export { SearchBar } from "./components/SearchBar";
export { CollectionInput } from "./components/CollectionInput";
export { DocumentEditor } from "./components/DocumentEditor";
export { CollectionSelectionView } from "./components/CollectionSelectionView";
export { CollectionDataView } from "./components/CollectionDataView";
export { CollectionBreadcrumbs } from "./components/CollectionBreadcrumbs";
export { FireCMSTable } from "./components/FireCMSTable";
export { DocumentIdHeaderWidget } from "./components/DocumentIdHeaderWidget";
export { SubcollectionDialog } from "./components/SubcollectionDialog";

// Hook exports
export { useRootCollections } from "./hooks/useRootCollections";
export { useCollectionData } from "./hooks/useCollectionData";
export { useFieldAnalysis } from "./hooks/useFieldAnalysis";
export { useDocumentMutation } from "./hooks/useDocumentMutation";
export { useSubscriptionCheck } from "./hooks/useSubscriptionCheck";
export { useInfiniteScroll } from "./hooks/useInfiniteScroll";

// Service exports
export { CollectionDiscovery, createCollectionDiscovery } from "./services/collectionDiscovery";
export type { ProjectsApi } from "./services/collectionDiscovery";
export { DataFetcher, createDataFetcher } from "./services/dataFetcher";
export { FieldAnalyzer, createFieldAnalyzer } from "./services/fieldAnalyzer";
export { DocumentMutationService, createDocumentMutationService } from "./services/documentMutation";
export { SubscriptionService, createSubscriptionService } from "./services/subscriptionService";

// Type exports
export type {
    DataType,
    ViewMode,
    SubscriptionTier,
    InferredField,
    InferredSchema,
    DocumentData,
    FilterOperator,
    ColumnFilter,
    FilterState,
    FirestoreItemType,
    FirestoreItem,
    NavigationState
} from "./types";

// Utility exports
export { filterDocuments } from "./utils/filterDocuments";
