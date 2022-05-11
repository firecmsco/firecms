import React, { useCallback } from "react";
import { Blocker, Transition } from "history";
import { UNSAFE_NavigationContext, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CustomDialogActions } from "../components";

export function useNavigationUnsavedChangesDialog(when: boolean, onSuccess: () => void):
    {
        navigationWasBlocked: boolean,
        handleCancel: () => void,
        handleOk: () => void
    } {

    const [nextLocation, setNextLocation] = React.useState<any | undefined>();
    const { navigator } = React.useContext(UNSAFE_NavigationContext);

    const navigate = useNavigate();

    const handleCancel = () => {
        setNextLocation(undefined);
    };

    const handleOk = () => {
        onSuccess();
        setNextLocation(undefined);
        navigate(-1);
    };

    const blocker: Blocker = useCallback(({ action, location: nextLocation, retry }) => {
        switch (action) {
            case "REPLACE": {
                retry();
                return;
            }
            case "POP": {
                setNextLocation(nextLocation);
            }
        }
    }, []);

    React.useEffect(() => {
        if (!when) return;
        if (nextLocation) return;
        if (!("block" in navigator)) return;
        const unblock = (navigator as any).block((tx: Transition) => {
            const autoUnblockingTx = {
                ...tx,
                retry() {
                    unblock();
                    tx.retry();
                }
            };
            blocker(autoUnblockingTx);
        });

        return unblock;
    }, [navigator, blocker, when, nextLocation]);

    return { navigationWasBlocked: Boolean(nextLocation), handleCancel, handleOk };
}

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
            keepMounted={false}
            open={open}
            onClose={handleCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle >
                {title ?? "Unsaved changes"}
            </DialogTitle>
            <DialogContent>
                {body && <DialogContentText>
                    {body}
                </DialogContentText>}
                <DialogContentText >
                    Are you sure you want to leave this page?
                </DialogContentText>
            </DialogContent>
            <CustomDialogActions>
                <Button onClick={handleCancel} autoFocus> Cancel </Button>
                <Button onClick={handleOk}> Ok </Button>
            </CustomDialogActions>
        </Dialog>
    );
}
