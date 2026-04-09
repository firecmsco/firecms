import React, { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@rebasepro/ui";
import { useTranslation } from "@rebasepro/core";

interface RenameGroupDialogProps {
    open: boolean;
    initialName: string;
    existingGroupNames: string[]; // Names of other existing groups to check for duplicates
    onClose: () => void;
    onRename: (newName: string) => void;
}

export function RenameGroupDialog({
    open,
    initialName,
    existingGroupNames,
    onClose,
    onRename
}: RenameGroupDialogProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(initialName);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null); // Create a ref for the input

    useEffect(() => {
        if (open) {
            setName(initialName);
            setError(null);
            // Focus and select text when dialog opens
            setTimeout(() => { // setTimeout to ensure the input is rendered and focusable
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 100);
        }
    }, [initialName, open]);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newName = event.target.value;
        setName(newName);
        if (!newName.trim()) {
            setError(t("group_name_empty_error"));
        } else if (existingGroupNames.includes(newName.trim())) {
            setError(t("group_name_exists_error"));
        } else {
            setError(null);
        }
    };

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError(t("group_name_empty_error"));
            return;
        }
        if (existingGroupNames.includes(trimmedName)) {
            setError(t("group_name_exists_error"));
            return;
        }
        if (!error) {
            onRename(trimmedName);
            onClose();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default form submission behavior
            const trimmedName = name.trim();
            // We need to check the error state directly as well,
            // because the error state might not have updated if the user types and immediately hits enter.
            let currentError = null;
            if (!trimmedName) {
                currentError = t("group_name_empty_error");
            } else if (existingGroupNames.includes(trimmedName)) {
                currentError = t("group_name_exists_error");
            }

            if (!currentError && trimmedName) {
                handleSave();
            } else if (currentError) {
                setError(currentError); // Ensure error is displayed if trying to submit with Enter
            }
        }
    };

    const handleClose = () => {
        setName(initialName);
        setError(null);
        onClose();
    };

    if (!open) return null;

    return (
        <Dialog open={open}>
            <DialogTitle>{t("rename_group")}</DialogTitle>
            <DialogContent>
                <TextField
                    inputRef={inputRef} // Pass the ref to the TextField
                    label={t("group_name_label")}
                    value={name}
                    onChange={handleNameChange}
                    onKeyDown={handleKeyDown} // Added onKeyDown handler
                    error={!!error}
                    aria-describedby={error ? "group-name-error" : undefined}
                />
                {error && <p id="group-name-error" style={{ display: "none" }}>{error}</p>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}
                    variant="text">
                    {t("cancel")}
                </Button>
                <Button onClick={handleSave}
                    disabled={!!error || !name.trim()}>
                    {t("save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
