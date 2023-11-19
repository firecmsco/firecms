/**
 * Controller to open the side dialog
 * @category Hooks and utilities
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
 * @category Hooks and utilities
 */
export interface DialogControllerEntryProps {

    key: string;
    /**
     * The component type that will be rendered
     */
    Component: React.ComponentType<{ open: boolean }>;

}
