import { useContext } from "react";
import { SnackbarContext } from "../core/contexts/SnackbarContext";

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
     * Is there currently an open snackbar
     */
    isOpen: boolean;

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
        title?: string;
        message: string;
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
export const useSnackbarController = () => useContext<SnackbarController>(SnackbarContext);
