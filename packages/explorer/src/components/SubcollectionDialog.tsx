import React, { useState } from "react";
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Button, 
    Typography,
    TextField
} from "@firecms/ui";

interface SubcollectionDialogProps {
    open: boolean;
    documentId: string;
    currentPath: string;
    onClose: () => void;
    onNavigate: (subcollectionPath: string) => void;
}

/**
 * Dialog for selecting which subcollection to explore within a document
 */
export const SubcollectionDialog: React.FC<SubcollectionDialogProps> = ({
    open,
    documentId,
    currentPath,
    onClose,
    onNavigate
}) => {
    const [subcollectionName, setSubcollectionName] = useState("");

    const handleNavigate = () => {
        if (subcollectionName.trim()) {
            // Create proper collection path: currentPath/documentId/subcollectionName
            const fullPath = `${currentPath}/${documentId}/${subcollectionName.trim()}`;
            onNavigate(fullPath);
            onClose();
            setSubcollectionName("");
        }
    };

    const handleClose = () => {
        onClose();
        setSubcollectionName("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNavigate();
        }
    };

    // Common subcollection names for quick selection
    const commonSubcollections = [
        "orders",
        "items", 
        "comments",
        "reviews",
        "messages",
        "notifications",
        "history",
        "settings",
        "permissions",
        "metadata"
    ];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTitle>
                <div className="flex items-center gap-2">
                    <span className="text-xl">📁</span>
                    <div>
                        <Typography variant="h6">
                            Explore Subcollections
                        </Typography>
                        <Typography variant="body2" className="text-surface-600 dark:text-surface-400">
                            Document: <code className="bg-surface-100 dark:bg-surface-800 px-1 rounded text-xs">{documentId}</code>
                        </Typography>
                    </div>
                </div>
            </DialogTitle>
            
            <DialogContent className="space-y-4">
                <div>
                    <Typography variant="body2" className="mb-2 text-surface-700 dark:text-surface-300">
                        Enter the name of the subcollection you want to explore:
                    </Typography>
                    <TextField
                        value={subcollectionName}
                        onChange={(e) => setSubcollectionName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., orders, comments, items"
                        className="w-full"
                        autoFocus
                    />
                </div>

                <div>
                    <Typography variant="body2" className="mb-2 text-surface-700 dark:text-surface-300">
                        Or select a common subcollection:
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                        {commonSubcollections.map((name) => (
                            <Button
                                key={name}
                                variant="outlined"
                                size="small"
                                onClick={() => setSubcollectionName(name)}
                                className="text-xs"
                            >
                                {name}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="bg-surface-50 dark:bg-surface-800 p-3 rounded">
                    <Typography variant="caption" className="text-surface-600 dark:text-surface-400">
                        💡 <strong>Tip:</strong> Subcollections in Firestore are nested under documents. 
                        The full path will be: <code className="bg-surface-100 dark:bg-surface-700 px-1 rounded text-xs">
                            {currentPath}/{documentId}/{subcollectionName || "subcollection-name"}
                        </code>
                    </Typography>
                </div>
            </DialogContent>
            
            <DialogActions>
                <Button variant="text" onClick={handleClose}>
                    Cancel
                </Button>
                <Button 
                    variant="filled" 
                    onClick={handleNavigate}
                    disabled={!subcollectionName.trim()}
                >
                    Explore Subcollection
                </Button>
            </DialogActions>
        </Dialog>
    );
};