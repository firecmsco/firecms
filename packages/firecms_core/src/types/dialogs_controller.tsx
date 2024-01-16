import React from "react";

/**
 * Controller to open the side dialog
 * @group Hooks and utilities
 */
export interface DialogsController {

    /**
     * Close the last dialog
     */
    close: () => void;

    /**
     * Open a dialog
     * @param props
     */
    open: (props: DialogControllerEntryProps) => { closeDialog: () => void };
}

/**
 * Props used to open a side dialog
 * @group Hooks and utilities
 */
export interface DialogControllerEntryProps {

    key: string;
    /**
     * The component type that will be rendered
     */
    Component: React.ComponentType<{ open: boolean, closeDialog: () => void }>;

}
