import { DataSource, Entity } from "@firecms/core";
import { DocumentData } from "../types";

/**
 * Service for fetching Firestore data
 */
export class DataFetcher {
    private dataSource: DataSource;
    private defaultLimit: number;

    constructor(dataSource: DataSource, defaultLimit: number = 20) {
        this.dataSource = dataSource;
        this.defaultLimit = defaultLimit;
    }

    /**
     * Fetch documents from a collection
     * @param path Collection path
     * @param limit Maximum number of documents to fetch (default: 20)
     * @returns Array of document data
     */
    async fetchCollection(
        path: string,
        limit?: number
    ): Promise<DocumentData[]> {
        try {
            const fetchLimit = limit || this.defaultLimit;
            
            // Ensure minimum of 20 documents (or all if less than 20 exist)
            const actualLimit = Math.max(fetchLimit, 20);

            const entities = await this.dataSource.fetchCollection({
                path,
                limit: actualLimit
            });

            return entities.map(entity => this.entityToDocumentData(entity, path));
        } catch (error) {
            console.error(`Error fetching collection ${path}:`, error);
            throw new Error(`Failed to fetch collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Fetch more documents with pagination
     * @param path Collection path
     * @param startAfter Cursor to start after (last document from previous fetch)
     * @param limit Maximum number of documents to fetch
     * @returns Array of document data
     */
    async fetchMore(
        path: string,
        startAfter: any,
        limit?: number
    ): Promise<DocumentData[]> {
        try {
            const fetchLimit = limit || this.defaultLimit;

            const entities = await this.dataSource.fetchCollection({
                path,
                limit: fetchLimit,
                startAfter // Pass the entire document/entity as cursor
            });

            return entities.map(entity => this.entityToDocumentData(entity, path));
        } catch (error) {
            console.error(`Error fetching more documents from ${path}:`, error);
            throw new Error(`Failed to fetch more documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }



    /**
     * Convert Entity to DocumentData
     */
    private entityToDocumentData(entity: Entity<any>, collectionPath: string): DocumentData {
        return {
            id: entity.id,
            path: `${collectionPath}/${entity.id}`,
            data: entity.values || {}
        };
    }
}

/**
 * Create a DataFetcher instance
 */
export function createDataFetcher(
    dataSource: DataSource,
    defaultLimit?: number
): DataFetcher {
    return new DataFetcher(dataSource, defaultLimit);
}
