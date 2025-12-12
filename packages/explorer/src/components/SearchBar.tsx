import React, { useState, useEffect } from "react";
import { DebouncedTextField, Button, Typography } from "@firecms/ui";
import { FilterState } from "../types";

interface SearchBarProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    resultCount?: number;
}

/**
 * Search bar with filter controls
 */
export const SearchBar: React.FC<SearchBarProps> = ({
    filters,
    onFiltersChange,
    resultCount
}) => {
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm);

    useEffect(() => {
        setSearchTerm(filters.searchTerm);
    }, [filters.searchTerm]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        onFiltersChange({
            ...filters,
            searchTerm: value
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        onFiltersChange({
            searchTerm: '',
            columnFilters: {}
        });
    };

    const hasActiveFilters = filters.searchTerm || Object.keys(filters.columnFilters).length > 0;

    return (
        <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-600">
            <div className="flex-1">
                <DebouncedTextField
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search documents..."
                    size="small"
                    className="w-full"
                />
            </div>

            {hasActiveFilters && (
                <>
                    <Button
                        variant="text"
                        color="neutral"
                        size="small"
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </Button>
                    {resultCount !== undefined && (
                        <Typography variant="caption" className="text-text-secondary dark:text-text-secondary-dark whitespace-nowrap">
                            {resultCount} result{resultCount !== 1 ? 's' : ''}
                        </Typography>
                    )}
                </>
            )}
        </div>
    );
};
