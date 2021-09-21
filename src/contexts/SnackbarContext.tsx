import React, { useContext, useState } from "react";
import { Snackbar } from "@mui/material";
import Alert from "@mui/lab/Alert/Alert";

const DEFAULT_STATE = {
    isOpen: false,
    close: () => {
    },
    open: (props: {
        type: SnackbarMessageType;
        message: string;
    }) => {
    }
};

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
};

export const SnackbarContext = React.createContext<SnackbarController>(DEFAULT_STATE);

/**
 * Hook to retrieve the SnackbarContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FirebaseCMSApp` or a `CMSAppProvider`
 *
 * @see SnackbarController
 * @category Hooks and utilities
 */
export const useSnackbarController = () => useContext<SnackbarController>(SnackbarContext);

interface ISelectedEntityProviderProps {
    children: React.ReactNode;
}

export const SnackbarProvider: React.FC<ISelectedEntityProviderProps> = ({ children }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [message, setMessage] = useState<string | undefined>(undefined);
    const [type, setType] = useState<SnackbarMessageType | undefined>(undefined);

    const close = () => {
        setIsOpen(false);
        setTitle(undefined);
        setMessage(undefined);
        setType(undefined);
    };

    const open = (props: {
        type: SnackbarMessageType;
        title?: string;
        message: string;
    }) => {
        const { type, message, title } = props;
        setType(type);
        setMessage(message);
        setTitle(title);
        setIsOpen(true);
    };

    return (
        <SnackbarContext.Provider
            value={{
                isOpen,
                close,
                open
            }}
        >

            {children}

            <Snackbar open={isOpen}
                      autoHideDuration={3000}
                      onClose={(_) => close()}>
                <Alert elevation={1}
                       variant="filled"
                       onClose={(_) => close()}
                       severity={type}>

                    {title && <div>{title}</div>}
                    {message && <div>{message}</div>}

                </Alert>
            </Snackbar>

        </SnackbarContext.Provider>
    );
};
