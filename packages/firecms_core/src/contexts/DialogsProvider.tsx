import React, { PropsWithChildren, useCallback, useRef, useState } from "react";
import { DialogControllerEntryProps, DialogsController } from "../types/dialogs_controller";

export const DialogsControllerContext = React.createContext<DialogsController>({} as DialogsController);

export const DialogsProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {

    const [dialogEntries, setDialogEntries] = useState<DialogControllerEntryProps[]>([]);
    const dialogEntriesRef = useRef<DialogControllerEntryProps[]>(dialogEntries);

    const updateDialogEntries = (newPanels: DialogControllerEntryProps[]) => {
        dialogEntriesRef.current = newPanels;
        setDialogEntries(newPanels);
    };

    const close = useCallback(() => {

        if (dialogEntries.length === 0)
            return;

        const updatedPanels = [...dialogEntriesRef.current.slice(0, -1)];
        updateDialogEntries(updatedPanels);

    }, [dialogEntries]);

    const open = useCallback((dialogEntry: DialogControllerEntryProps) => {

        const updatedPanels = [...dialogEntriesRef.current, dialogEntry];
        updateDialogEntries(updatedPanels);

        return {
            closeDialog: () => {
                const updatedPanels = dialogEntriesRef.current.filter(e => e.key !== dialogEntry.key);
                updateDialogEntries(updatedPanels);
            }
        }
    }, [dialogEntries]);

    return (
        <DialogsControllerContext.Provider value={{
            open,
            close
        }}>
            {children}
            {dialogEntries.map((entry, i) => <entry.Component
                key={`dialog_${i}`}
                open={true}
                closeDialog={close}
            />)}
        </DialogsControllerContext.Provider>
    );
};
