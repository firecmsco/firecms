import React, { useState } from "react";
import {
    IconButton,
    Tooltip,
    Popover,
    Button,
    cls,
    focusedDisabled,
    SearchIcon,
    KeyboardTabIcon
} from "@firecms/ui";

interface DocumentIdHeaderWidgetProps {
    onDocumentFilter: (documentId: string) => void;
}

/**
 * Header widget for Document ID column with search functionality
 */
export const DocumentIdHeaderWidget: React.FC<DocumentIdHeaderWidgetProps> = ({
    onDocumentFilter
}) => {
    const [openPopup, setOpenPopup] = useState(false);
    const [searchString, setSearchString] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOpenPopup(false);
        const documentId = searchString.trim();
        onDocumentFilter(documentId);
        setSearchString("");
    };

    return (
        <Tooltip title={!openPopup ? "Find by ID" : undefined} asChild={false}>
            <Popover
                open={openPopup}
                onOpenChange={setOpenPopup}
                sideOffset={0}
                align="start"
                alignOffset={-117}
                trigger={
                    <IconButton size="small">
                        <SearchIcon size="small" />
                    </IconButton>
                }
            >
                <div className={cls(
                    "my-2 rounded-lg bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white"
                )}>
                    <form 
                        noValidate={true}
                        onSubmit={handleSubmit}
                        className="w-96 max-w-full"
                    >
                        <div className="flex p-3 w-full gap-2">
                            <input
                                autoFocus={openPopup}
                                placeholder="Find document by ID"
                                onChange={(e) => setSearchString(e.target.value)}
                                value={searchString}
                                className={cls(
                                    "rounded-md bg-white dark:bg-surface-800 flex-grow bg-transparent outline-none px-3 py-2 text-sm border border-surface-200 dark:border-surface-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400",
                                    focusedDisabled
                                )}
                            />
                            <Button 
                                variant="text"
                                disabled={!searchString.trim()}
                                type="submit"
                            >
                                <KeyboardTabIcon />
                            </Button>
                        </div>
                    </form>
                </div>
            </Popover>
        </Tooltip>
    );
};