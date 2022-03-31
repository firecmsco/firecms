
/**
 * Controller to open the side dialog
 * @category Hooks and utilities
 */
export interface SideDialogsController {

    /**
     * Close the last panel
     */
    close: () => void;

    /**
     * List of side panels currently open
     */
    sidePanels: SideDialogPanelProps[];

    /**
     * Open one or multiple side panels
     * @param props
     */
    open: <P>(panelProps: SideDialogPanelProps<P> | SideDialogPanelProps<P>[]) => void;

    /**
     * Replace the last open panel with the given one
     * @param props
     */
    replace: <P>(panelProps: SideDialogPanelProps<P>) => void;
}

/**
 * Props used to open a side dialog
 * @category Hooks and utilities
 */
export interface SideDialogPanelProps<P = any> {

    /**
     * A key that identifies this panel
     */
    key: string;

    /**
     * The component type that will be rendered
     */
    Component: React.ComponentType<P>;

    /**
     * The props passed to the rendered component
     */
    props: P;

    /**
     * Optional width of the panel
     */
    width?: string;

    /**
     * When open, change the URL to this path.
     * Note that if you want to restore state from a URL you need to add the
     * logic yourself by listening to URL updates, and probably call `open`
     */
    urlPath?: string;

    /**
     * If the navigation stack is empty (you landed in the `urlPath` url), what
     * url path to change to when the panel gets closed
     */
    parentUrlPath?: string;

}
