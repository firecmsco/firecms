import { DocumentData, FilterState, ColumnFilter } from "../types";

/**
 * Filter documents based on search term and column filters
 */
export function filterDocuments(
    documents: DocumentData[],
    filters: FilterState
): DocumentData[] {
    let filtered = documents;

    // Apply search term filter
    if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(doc => {
            return matchesSearchTerm(doc.data, searchLower);
        });
    }

    // Apply column filters
    Object.entries(filters.columnFilters).forEach(([field, filter]) => {
        filtered = filtered.filter(doc => {
            return matchesColumnFilter(doc, field, filter);
        });
    });

    return filtered;
}

/**
 * Check if document matches search term in any field
 */
function matchesSearchTerm(data: any, searchTerm: string): boolean {
    if (data === null || data === undefined) {
        return false;
    }

    if (typeof data === 'string') {
        return data.toLowerCase().includes(searchTerm);
    }

    if (typeof data === 'number' || typeof data === 'boolean') {
        return String(data).toLowerCase().includes(searchTerm);
    }

    if (Array.isArray(data)) {
        return data.some(item => matchesSearchTerm(item, searchTerm));
    }

    if (typeof data === 'object') {
        return Object.values(data).some(value => matchesSearchTerm(value, searchTerm));
    }

    return false;
}

/**
 * Check if document matches column filter
 */
function matchesColumnFilter(
    doc: DocumentData,
    fieldPath: string,
    filter: ColumnFilter
): boolean {
    const value = getNestedValue(doc.data, fieldPath);

    switch (filter.operator) {
        case 'equals':
            return value === filter.value;

        case 'contains':
            if (typeof value === 'string') {
                return value.toLowerCase().includes(String(filter.value).toLowerCase());
            }
            if (Array.isArray(value)) {
                return value.includes(filter.value);
            }
            return false;

        case 'gt':
            return typeof value === 'number' && value > Number(filter.value);

        case 'lt':
            return typeof value === 'number' && value < Number(filter.value);

        case 'gte':
            return typeof value === 'number' && value >= Number(filter.value);

        case 'lte':
            return typeof value === 'number' && value <= Number(filter.value);

        case 'exists':
            return filter.value ? value !== undefined : value === undefined;

        default:
            return true;
    }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        if (value === null || value === undefined) {
            return undefined;
        }
        value = value[key];
    }

    return value;
}
