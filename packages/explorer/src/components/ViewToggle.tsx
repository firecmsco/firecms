import React from "react";
import { Button } from "@firecms/ui";
import { ViewMode } from "../types";

interface ViewToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Toggle button for switching between table and JSON views
 */
export const ViewToggle: React.FC<ViewToggleProps> = ({
    viewMode,
    onViewModeChange
}) => {
    return (
        <div className="flex gap-2">
            <Button
                variant={viewMode === 'table' ? 'filled' : 'outlined'}
                color={viewMode === 'table' ? 'primary' : 'neutral'}
                size="medium"
                onClick={() => onViewModeChange('table')}
                className="min-w-[80px]"
            >
                📊 Table
            </Button>
            <Button
                variant={viewMode === 'json' ? 'filled' : 'outlined'}
                color={viewMode === 'json' ? 'primary' : 'neutral'}
                size="medium"
                onClick={() => onViewModeChange('json')}
                className="min-w-[80px]"
            >
                {} JSON
            </Button>
        </div>
    );
};
