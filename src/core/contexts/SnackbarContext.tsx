import React, { useState } from "react";
import { Snackbar } from "@mui/material";
import Alert from "@mui/lab/Alert/Alert";
import {
    SnackbarController,
    SnackbarMessageType
} from "../../hooks/useSnackbarController";

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

export const SnackbarContext = React.createContext<SnackbarController>(DEFAULT_STATE);

export const SnackbarProvider: React.FC = ({ children }) => {

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
