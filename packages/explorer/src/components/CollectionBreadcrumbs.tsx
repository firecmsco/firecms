import React from "react";
import { Button, Typography } from "@firecms/ui";

interface CollectionBreadcrumbsProps {
    navigationPath: string[];
    onNavigateBack: (targetIndex?: number) => void;
    onBackToSelection: () => void;
}

/**
 * Breadcrumb navigation for collection paths
 */
export const CollectionBreadcrumbs: React.FC<CollectionBreadcrumbsProps> = ({
    navigationPath,
    onNavigateBack,
    onBackToSelection
}) => {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="text"
                color="neutral"
                size="small"
                onClick={onBackToSelection}
                className="text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200"
            >
                ← Collections
            </Button>
            
            {navigationPath.length > 0 && (
                <>
                    <div className="h-4 w-px bg-surface-300 dark:bg-surface-600" />
                    
                    <div className="flex items-center gap-1">
                        {navigationPath.map((segment, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <Typography 
                                        variant="body2" 
                                        className="text-surface-400 dark:text-surface-500 mx-1"
                                    >
                                        /
                                    </Typography>
                                )}
                                
                                {index === navigationPath.length - 1 ? (
                                    // Current segment - not clickable
                                    <Typography 
                                        variant="subtitle2" 
                                        className="font-medium text-surface-800 dark:text-surface-200"
                                    >
                                        {segment}
                                    </Typography>
                                ) : (
                                    // Previous segments - clickable
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => onNavigateBack(index)}
                                        className="text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 p-1 min-w-0"
                                    >
                                        <Typography variant="body2">
                                            {segment}
                                        </Typography>
                                    </Button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};