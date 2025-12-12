import React from "react";
import { 
    Container, 
    Typography, 
    Paper,
    CircularProgress
} from "@firecms/ui";
import { CollectionInput } from "./CollectionInput";

interface CollectionSelectionViewProps {
    rootCollections: string[];
    collectionsLoading: boolean;
    onCollectionSelect: (collectionPath: string) => void;
}

/**
 * Initial view for selecting a collection to explore
 */
export const CollectionSelectionView: React.FC<CollectionSelectionViewProps> = ({
    rootCollections,
    collectionsLoading,
    onCollectionSelect
}) => {
    const handleLoadCollection = (collectionPath: string) => {
        if (collectionPath.trim()) {
            onCollectionSelect(collectionPath.trim());
        }
    };

    return (
        <Container className="p-6 max-w-4xl space-y-6">
            {/* Header */}
            <div className="my-8">
                <Typography variant="h3" gutterBottom={true} className="font-mono ml-4 my-2">
                    Welcome to EXPLORER
                </Typography>
                <Typography paragraph={true} className="ml-4 my-2">
                    Explorer is a schema-less interface to your Firestore data. You can browse, inspect, and edit
                    collections without predefined schemas - we'll discover the structure automatically.
                </Typography>
                <Typography paragraph={true} className="ml-4 my-2 mb-6">
                    Select a collection below to start exploring your data structure and content.
                </Typography>
            </div>

            {/* Collection Input */}
            {collectionsLoading ? (
                <Paper className="p-8">
                    <div className="flex items-center justify-center gap-3">
                        <CircularProgress size="small" />
                        <Typography variant="body1" className="text-gray-600 dark:text-surface-400">
                            Discovering collections...
                        </Typography>
                    </div>
                </Paper>
            ) : (
                <CollectionInput
                    value=""
                    rootCollections={rootCollections}
                    onChange={() => {}} // Not used in this flow
                    onSubmit={() => {}} // Not used in this flow
                    onCollectionSelect={handleLoadCollection}
                />
            )}

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
                <Paper className="p-6 text-center space-y-3 hover:shadow-md transition-shadow">
                    <div className="text-3xl">📊</div>
                    <Typography variant="h6" className="text-gray-800 dark:text-surface-200">
                        Schema-less Browsing
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 dark:text-surface-400">
                        No configuration needed. We automatically infer your data structure.
                    </Typography>
                </Paper>

                <Paper className="p-6 text-center space-y-3 hover:shadow-md transition-shadow">
                    <div className="text-3xl">✏️</div>
                    <Typography variant="h6" className="text-gray-800 dark:text-surface-200">
                        Inline Editing
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 dark:text-surface-400">
                        Edit documents directly in the table or JSON view.
                    </Typography>
                </Paper>

                <Paper className="p-6 text-center space-y-3 hover:shadow-md transition-shadow">
                    <div className="text-3xl">🔎</div>
                    <Typography variant="h6" className="text-gray-800 dark:text-surface-200">
                        Smart Search
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 dark:text-surface-400">
                        Filter and search through your documents with ease.
                    </Typography>
                </Paper>
            </div>

            {/* Getting Started */}
            {rootCollections.length > 0 && (
                <Paper className="p-6 bg-green-50 dark:bg-surface-800 border border-green-200 dark:border-surface-600">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">💡</div>
                        <div>
                            <Typography variant="h6" className="text-green-800 dark:text-green-400 mb-2">
                                Quick Start
                            </Typography>
                            <Typography variant="body2" className="text-green-700 dark:text-green-300">
                                We found <strong>{rootCollections.length}</strong> collection{rootCollections.length !== 1 ? 's' : ''} in your project. 
                                Click on any collection above to start exploring, or type a custom path.
                            </Typography>
                        </div>
                    </div>
                </Paper>
            )}
        </Container>
    );
};