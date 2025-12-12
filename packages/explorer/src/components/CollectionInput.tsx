import React, { useState } from "react";
import { 
    Button, 
    TextField, 
    Paper, 
    Typography, 
    Chip, 
    InputLabel
} from "@firecms/ui";

interface CollectionInputProps {
    value: string;
    rootCollections: string[];
    onChange: (path: string) => void;
    onSubmit: () => void;
    onCollectionSelect?: (collectionPath: string) => void;
}

/**
 * Input field for entering collection paths with autocomplete
 */
export const CollectionInput: React.FC<CollectionInputProps> = ({
    value,
    rootCollections,
    onChange,
    onSubmit,
    onCollectionSelect
}) => {
    const [inputValue, setInputValue] = useState(value);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onChange(inputValue);
            if (onCollectionSelect && inputValue.trim()) {
                onCollectionSelect(inputValue.trim());
            } else {
                onSubmit();
            }
        }
    };

    const handleSelect = (selected: string) => {
        setInputValue(selected);
        onChange(selected);
        if (onCollectionSelect) {
            onCollectionSelect(selected);
        } else {
            onSubmit();
        }
    };

    return (
        <Paper className="p-6 space-y-4">
            <div className="space-y-6">
                <InputLabel>
                    Collection Path
                </InputLabel>
                <div className="flex gap-3 items-start">
                    <div className="flex-1">
                        <TextField
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter collection path (e.g., demo, books)"
                            onKeyDown={handleKeyDown}
                            size="medium"
                            className="w-full"
                        />
                    </div>
                    <Button
                        variant="filled"
                        color="primary"
                        size="medium"
                        onClick={() => {
                            onChange(inputValue);
                            if (onCollectionSelect && inputValue.trim()) {
                                onCollectionSelect(inputValue.trim());
                            } else {
                                onSubmit();
                            }
                        }}
                    >
                        🔍 Load
                    </Button>
                </div>
            </div>

            {rootCollections.length > 0 && (
                <div className="space-y-3">
                    <Typography variant="body2" className="text-surface-600 dark:text-surface-400">
                        Available collections:
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                        {rootCollections.map((collection) => (
                            <Chip
                                key={collection}
                                onClick={() => handleSelect(collection)}
                                className="cursor-pointer hover:bg-surface-accent-300 hover:bg-opacity-60 dark:hover:bg-surface-700 dark:hover:bg-opacity-60 transition-colors"
                                colorScheme="blue"
                                size="medium"
                            >
                                📁 {collection}
                            </Chip>
                        ))}
                    </div>
                    <Typography variant="caption" className="text-surface-500 dark:text-surface-400">
                        💡 Click on a collection name above to select it quickly
                    </Typography>
                </div>
            )}
        </Paper>
    );
};
