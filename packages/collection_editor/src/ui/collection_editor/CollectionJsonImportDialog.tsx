import React, { useCallback, useState } from "react";
import {
    Button,
    cls,
    CodeIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@firecms/ui";
import { EntityCollection } from "@firecms/core";
import { validateCollectionJson, CollectionValidationError } from "../../utils/validateCollectionJson";

const EXAMPLE_JSON = `{
  "id": "products",
  "name": "Products",
  "path": "products",
  "icon": "shopping_cart",
  "properties": {
    "name": {
      "type": "string",
      "name": "Name",
      "validation": { "required": true }
    },
    "price": {
      "type": "number",
      "name": "Price"
    },
    "available": {
      "type": "boolean",
      "name": "Available"
    }
  }
}`;

export interface CollectionJsonImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImport: (collection: EntityCollection) => void;
}

export function CollectionJsonImportDialog({
    open,
    onClose,
    onImport
}: CollectionJsonImportDialogProps) {
    const [jsonValue, setJsonValue] = useState<string>("");
    const [errors, setErrors] = useState<CollectionValidationError[]>([]);
    const [touched, setTouched] = useState(false);

    const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setJsonValue(value);
        setTouched(true);

        if (!value.trim()) {
            setErrors([]);
            return;
        }

        const result = validateCollectionJson(value);
        setErrors(result.errors);
    }, []);

    const handleImport = useCallback(() => {
        const result = validateCollectionJson(jsonValue);
        if (result.valid && result.collection) {
            onImport(result.collection);
            setJsonValue("");
            setErrors([]);
            setTouched(false);
            onClose();
        }
    }, [jsonValue, onImport, onClose]);

    const handleClose = useCallback(() => {
        setJsonValue("");
        setErrors([]);
        setTouched(false);
        onClose();
    }, [onClose]);

    const isValid = touched && jsonValue.trim() && errors.length === 0;

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => !open && handleClose()}
            maxWidth="2xl"
        >
            <DialogTitle className="flex items-center gap-2">
                <CodeIcon size="small" />
                Import Collection from JSON
            </DialogTitle>
            <DialogContent className="flex flex-col gap-4">
                <Typography variant="body2" color="secondary">
                    Paste a JSON object representing your collection configuration.
                    The JSON must include <code className="bg-surface-200 dark:bg-surface-700 px-1 rounded">id</code>,
                    <code className="bg-surface-200 dark:bg-surface-700 px-1 rounded">name</code>,
                    <code className="bg-surface-200 dark:bg-surface-700 px-1 rounded">path</code>, and
                    <code className="bg-surface-200 dark:bg-surface-700 px-1 rounded">properties</code>.
                </Typography>

                <textarea
                    value={jsonValue}
                    onChange={handleJsonChange}
                    placeholder={EXAMPLE_JSON}
                    rows={12}
                    className={cls(
                        "w-full p-3 font-mono text-sm rounded-md border resize-none overflow-y-auto",
                        "bg-surface-50 dark:bg-surface-900",
                        "focus:outline-none focus:ring-2 focus:ring-primary",
                        "h-[300px]",
                        errors.length > 0 && touched
                            ? "border-red-500 dark:border-red-400"
                            : "border-surface-300 dark:border-surface-600"
                    )}
                />

                {errors.length > 0 && touched && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                        <Typography variant="body2" className="font-medium text-red-700 dark:text-red-400 mb-2">
                            Validation errors:
                        </Typography>
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, index) => (
                                <li key={index} className="text-sm text-red-600 dark:text-red-400">
                                    {error.path ? (
                                        <>
                                            <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">
                                                {error.path}
                                            </code>
                                            : {error.message}
                                        </>
                                    ) : (
                                        error.message
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {isValid && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                        <Typography variant="body2" className="text-green-700 dark:text-green-400">
                            ✓ JSON is valid and ready to import
                        </Typography>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="text"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="filled"
                    color="primary"
                    onClick={handleImport}
                    disabled={!isValid}
                >
                    Import Collection
                </Button>
            </DialogActions>
        </Dialog>
    );
}
