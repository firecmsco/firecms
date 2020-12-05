import React, { useContext, useState } from "react";
import { Box, Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert/Alert";

const DEFAULT_STATE = {
    isOpen: false,
    type: undefined,
    title: undefined,
    message: undefined,
    close: () => {
    },
    open: (props: {
        type: MessageType;
        message: string;
    }) => {
    }
};

type MessageType = "success" | "info" | "warning" | "error";

export type SnackbarState = {
    isOpen: boolean;
    type?: MessageType;
    title?: string;
    message?: string;
    close: () => void;
    open: (props: {
        type: MessageType;
        title?: string;
        message: string;
    }) => void;
};

export const SnackbarContext = React.createContext<SnackbarState>(DEFAULT_STATE);
export const useSnackbarContext = () => useContext(SnackbarContext);

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
                title,
                message,
                type,
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

                    {title && <Box>{title}</Box>}
                    {message && <Box>{message}</Box>}

                </MuiAlert>
            </Snackbar>

        </SnackbarContext.Provider>
    );
};
