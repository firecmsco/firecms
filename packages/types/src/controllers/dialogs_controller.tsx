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
    open: <T extends object = object>(props: DialogControllerEntryProps<T>) => { closeDialog: () => void };
}

/**
 * Props used to open a side dialog
 * @group Hooks and utilities
 */
export interface DialogControllerEntryProps<T extends object = object> {

    key: string;
    /**
     * The component type that will be rendered
     */
    Component: React.ComponentType<{ open: boolean, closeDialog: () => void } & T>;
    /**
     * Props to pass to the dialog component
     */
    props?: T;

}
