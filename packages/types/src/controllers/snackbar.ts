
/**
 * Possible snackbar types
 * @group Hooks and utilities
 */
export type SnackbarMessageType = "success" | "info" | "warning" | "error";

/**
 * Controller to display snackbars
 * @group Hooks and utilities
 */
export interface SnackbarController {

    /**
     * Close the currently open snackbar
     */
    close: () => void;

    /**
     * Display a new snackbar. You need to specify the type and message.
     * You can optionally specify a title
     */
    open: (props: {
        type: SnackbarMessageType;
        message: React.ReactNode;
        autoHideDuration?: number;
    }) => void;

}
