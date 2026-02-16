import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";

export interface UnsavedChangesDialogProps {
    open: boolean;
    body?: React.ReactNode;
    title?: string;
    handleOk: () => void;
    handleCancel: () => void;
}

export function UnsavedChangesDialog({
                                         open,
                                         handleOk,
                                         handleCancel,
                                         body,
                                         title
                                     }: UnsavedChangesDialogProps) {

    return (
        <Dialog
            onEscapeKeyDown={() => {
                handleCancel();
            }}
            open={open}
        >
            <DialogTitle variant={"h6"}>{title}</DialogTitle>
            <DialogContent>

                {body}

                <Typography>
                    Are you sure you want to leave this page?
                </Typography>

            </DialogContent>
            <DialogActions>
                <Button variant="text"
                        onClick={handleCancel} autoFocus> Cancel </Button>
                <Button
                    onClick={handleOk}> Ok </Button>
            </DialogActions>
        </Dialog>
    );
}
