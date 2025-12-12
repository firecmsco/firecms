import { DocumentData, InferredSchema, InferredField, DataType } from "../types";

/**
 * Service for analyzing documents and inferring field information
 */
export class FieldAnalyzer {
    /**
     * Analyze documents to discover fields and infer types
     * @param documents Array of documents to analyze
     * @returns Inferred schema with field information
     */
    analyzeDocuments(documents: DocumentData[]): InferredSchema {
        if (documents.length === 0) {
            return {
                fields: [],
                totalDocuments: 0,
                analyzedDocuments: 0
            };
        }

        // Collect all field paths and their values across documents
        const fieldMap = new Map<string, any[]>();

        documents.forEach(doc => {
            const flattenedData = this.flattenNestedFields(doc.data);
            
            Object.entries(flattenedData).forEach(([path, value]) => {
                if (!fieldMap.has(path)) {
                    fieldMap.set(path, []);
                }
                fieldMap.get(path)!.push(value);
            });
        });

        // Build inferred fields
        const fields: InferredField[] = [];
        
        fieldMap.forEach((values, path) => {
            const field = this.buildInferredField(path, values, documents.length);
            fields.push(field);
        });

        // Sort fields: common fields first, then sparse fields, alphabetically within each group
        fields.sort((a, b) => {
            if (a.isSparse !== b.isSparse) {
                return a.isSparse ? 1 : -1;
            }
            return a.path.localeCompare(b.path);
        });

        return {
            fields,
            totalDocuments: documents.length,
            analyzedDocuments: documents.length
        };
    }

    /**
     * Build an inferred field from collected values
     */
    private buildInferredField(
        path: string,
        values: any[],
        totalDocuments: number
    ): InferredField {
        const occurrenceCount = values.length;
        const isSparse = occurrenceCount < totalDocuments * 0.5;
        
        // Filter out null/undefined for type inference
        const nonNullValues = values.filter(v => v !== null && v !== undefined);
        const isNullable = nonNullValues.length < values.length;

        // Infer type and detect conflicts
        const types = new Set<DataType>();
        nonNullValues.forEach(value => {
            types.add(this.inferFieldType([value]));
        });

        const hasTypeConflict = types.size > 1;
        const dataType = types.size > 0 ? Array.from(types)[0] : 'null';
        const conflictingTypes = hasTypeConflict ? Array.from(types) : undefined;

        // Extract field name from path (last segment)
        const pathSegments = path.split('.');
        const name = pathSegments[pathSegments.length - 1];

        return {
            name,
            path,
            dataType,
            occurrenceCount,
            isSparse,
            hasTypeConflict,
            conflictingTypes,
            isNullable
        };
    }

    /**
     * Infer data type from values
     * @param values Array of values to analyze
     * @returns Inferred data type
     */
    inferFieldType(values: any[]): DataType {
        if (values.length === 0) {
            return 'null';
        }

        const value = values[0];

        if (value === null || value === undefined) {
            return 'null';
        }

        if (typeof value === 'string') {
            return 'string';
        }

        if (typeof value === 'number') {
            return 'number';
        }

        if (typeof value === 'boolean') {
            return 'boolean';
        }

        if (Array.isArray(value)) {
            return 'array';
        }

        if (typeof value === 'object') {
            // Check for Firestore special types
            if (value.toDate && typeof value.toDate === 'function') {
                return 'timestamp';
            }
            
            if (value.path && value.id) {
                return 'reference';
            }
            
            if (value.latitude !== undefined && value.longitude !== undefined) {
                return 'geopoint';
            }

            return 'map';
        }

        return 'string';
    }

    /**
     * Detect if a field has multiple types across documents
     * @param values Array of values to check
     * @returns True if multiple types detected
     */
    detectTypeConflicts(values: any[]): boolean {
        const types = new Set<DataType>();
        
        values.forEach(value => {
            if (value !== null && value !== undefined) {
                types.add(this.inferFieldType([value]));
            }
        });

        return types.size > 1;
    }

    /**
     * Flatten nested objects into dot notation paths
     * @param data Object to flatten
     * @param prefix Optional prefix for nested paths
     * @returns Flattened object with dot notation keys
     */
    flattenNestedFields(
        data: Record<string, any>,
        prefix: string = ''
    ): Record<string, any> {
        const result: Record<string, any> = {};

        Object.entries(data).forEach(([key, value]) => {
            const path = prefix ? `${prefix}.${key}` : key;

            if (value === null || value === undefined) {
                result[path] = value;
            } else if (Array.isArray(value)) {
                // Store arrays as-is, don't flatten them
                result[path] = value;
            } else if (typeof value === 'object' && !this.isSpecialFirestoreType(value)) {
                // Recursively flatten nested objects
                const nested = this.flattenNestedFields(value, path);
                Object.assign(result, nested);
            } else {
                result[path] = value;
            }
        });

        return result;
    }

    /**
     * Check if value is a special Firestore type (Timestamp, Reference, GeoPoint)
     */
    private isSpecialFirestoreType(value: any): boolean {
        if (!value || typeof value !== 'object') {
            return false;
        }

        // Timestamp
        if (value.toDate && typeof value.toDate === 'function') {
            return true;
        }

        // Reference
        if (value.path && value.id) {
            return true;
        }

        // GeoPoint
        if (value.latitude !== undefined && value.longitude !== undefined) {
            return true;
        }

        return false;
    }
}

/**
 * Create a FieldAnalyzer instance
 */
export function createFieldAnalyzer(): FieldAnalyzer {
    return new FieldAnalyzer();
}
