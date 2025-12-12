import { DataSource } from "@firecms/core";

/**
 * Service for document CRUD operations
 */
export class DocumentMutationService {
    private dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Update a single field in a document
     * @param docPath Full document path (collection/docId)
     * @param field Field name (supports dot notation for nested fields)
     * @param value New value
     */
    async updateField(
        docPath: string,
        field: string,
        value: any
    ): Promise<void> {
        try {
            // Parse path to get collection and document ID
            const { collectionPath, entityId } = this.parsePath(docPath);

            // Fetch current document
            const entity = await this.dataSource.fetchEntity({
                path: collectionPath,
                entityId
            });

            if (!entity) {
                throw new Error(`Document not found: ${docPath}`);
            }

            // Update the field (handle dot notation for nested fields)
            const updatedValues = this.setNestedValue(
                { ...entity.values },
                field,
                value
            );

            // Save the updated document
            await this.dataSource.saveEntity({
                path: collectionPath,
                entityId,
                values: updatedValues,
                previousValues: entity.values,
                status: "existing"
            });
        } catch (error) {
            console.error(`Error updating field ${field} in ${docPath}:`, error);
            throw new Error(`Failed to update field: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update an entire document
     * @param docPath Full document path (collection/docId)
     * @param data New document data
     */
    async updateDocument(
        docPath: string,
        data: Record<string, any>
    ): Promise<void> {
        try {
            // Validate JSON structure
            this.validateDocumentData(data);

            const { collectionPath, entityId } = this.parsePath(docPath);

            // Fetch current document for previousValues
            const entity = await this.dataSource.fetchEntity({
                path: collectionPath,
                entityId
            });

            await this.dataSource.saveEntity({
                path: collectionPath,
                entityId,
                values: data,
                previousValues: entity?.values,
                status: "existing"
            });
        } catch (error) {
            console.error(`Error updating document ${docPath}:`, error);
            throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a new document
     * @param collectionPath Collection path
     * @param data Document data
     * @param id Optional document ID (auto-generated if not provided)
     * @returns Created document ID
     */
    async createDocument(
        collectionPath: string,
        data: Record<string, any>,
        id?: string
    ): Promise<string> {
        try {
            // Validate JSON structure
            this.validateDocumentData(data);

            const entity = await this.dataSource.saveEntity({
                path: collectionPath,
                entityId: id,
                values: data,
                status: "new"
            });

            return entity.id;
        } catch (error) {
            console.error(`Error creating document in ${collectionPath}:`, error);
            throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete a document
     * @param docPath Full document path (collection/docId)
     */
    async deleteDocument(docPath: string): Promise<void> {
        try {
            const { collectionPath, entityId } = this.parsePath(docPath);

            // Fetch the entity first
            const entity = await this.dataSource.fetchEntity({
                path: collectionPath,
                entityId
            });

            if (!entity) {
                throw new Error(`Document not found: ${docPath}`);
            }

            await this.dataSource.deleteEntity({
                entity
            });
        } catch (error) {
            console.error(`Error deleting document ${docPath}:`, error);
            throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate document data structure
     */
    private validateDocumentData(data: any): void {
        if (typeof data !== 'object' || data === null) {
            throw new Error('Document data must be a valid object');
        }

        if (Array.isArray(data)) {
            throw new Error('Document data cannot be an array');
        }

        // Check for valid JSON (no functions, undefined, etc.)
        try {
            JSON.parse(JSON.stringify(data));
        } catch (error) {
            throw new Error('Document data must be valid JSON');
        }
    }

    /**
     * Parse document path into collection path and entity ID
     */
    private parsePath(docPath: string): { collectionPath: string; entityId: string } {
        const segments = docPath.split('/').filter(s => s.length > 0);
        
        if (segments.length < 2) {
            throw new Error(`Invalid document path: ${docPath}`);
        }

        const entityId = segments[segments.length - 1];
        const collectionPath = segments.slice(0, -1).join('/');

        return { collectionPath, entityId };
    }

    /**
     * Set a nested value using dot notation
     */
    private setNestedValue(
        obj: Record<string, any>,
        path: string,
        value: any
    ): Record<string, any> {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        
        let current = obj;
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
        return obj;
    }
}

/**
 * Create a DocumentMutationService instance
 */
export function createDocumentMutationService(
    dataSource: DataSource
): DocumentMutationService {
    return new DocumentMutationService(dataSource);
}
