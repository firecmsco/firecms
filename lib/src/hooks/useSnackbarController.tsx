import { useSnackbar } from "notistack";
import { useCallback } from "react";

/**
 * Possible snackbar types
 * @category Hooks and utilities
 */
export type SnackbarMessageType = "success" | "info" | "warning" | "error";

/**
 * Controller to display snackbars
 * @category Hooks and utilities
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
    }) => void;
}

/**
 * Hook to retrieve the SnackbarContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see SnackbarController
 * @category Hooks and utilities
 */
export const useSnackbarController = () => {

    const {
        enqueueSnackbar,
        closeSnackbar
    } = useSnackbar();

    const open = useCallback((props: {
        type: SnackbarMessageType;
        // title?: string;
        message: React.ReactNode;
    }) => {
        const {
            type,
            message
        } = props;
        enqueueSnackbar({
            message,
            variant: type
        })
    }, []);

    return {
        open,
        close: closeSnackbar
    }

};
