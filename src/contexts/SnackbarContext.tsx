import React, { useContext, useState } from "react";
import { Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert/Alert";

const DEFAULT_STATE = {
    isOpen: false,
    close: () => {
    },
    open: (props: {
        type: MessageType;
        message: string;
    }) => {
    }
};

type MessageType = "success" | "info" | "warning" | "error";

export type SnackbarController = {
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
        type: MessageType;
        title?: string;
        message: string;
    }) => void;
};

export const SnackbarContext = React.createContext<SnackbarController>(DEFAULT_STATE);
export const useSnackbarController = () => useContext<SnackbarController>(SnackbarContext);

interface ISelectedEntityProviderProps {
    children: React.ReactNode;
}

export const SnackbarProvider: React.FC<ISelectedEntityProviderProps> = ({ children }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [message, setMessage] = useState<string | undefined>(undefined);
    const [type, setType] = useState<MessageType | undefined>(undefined);

    const close = () => {
        setIsOpen(false);
        setTitle(undefined);
        setMessage(undefined);
        setType(undefined);
    };

    const open = (props: {
        type: MessageType;
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
                <MuiAlert elevation={3}
                          variant="filled"
                          onClose={(_) => close()}
                          severity={type}>

                    {title && <div>{title}</div>}
                    {message && <div>{message}</div>}

                </MuiAlert>
            </Snackbar>

        </SnackbarContext.Provider>
    );
};
