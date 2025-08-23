import React, { useCallback, useMemo } from "react";
import { useSnackbar } from "notistack";
import { SnackbarMessageType } from "@firecms/types";


/**
 * Hook to retrieve the SnackbarContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FireCMS`
 *
 * @see SnackbarController
 * @group Hooks and utilities
 */
export const useSnackbarController = () => {

    const {
        enqueueSnackbar,
        closeSnackbar
    } = useSnackbar();

    const open = useCallback((props: {
        type: SnackbarMessageType;
        title?: string;
        message: React.ReactNode;
        autoHideDuration?: number;
    }) => {
        const {
            type,
            message,
            autoHideDuration
        } = props;
        enqueueSnackbar({
            message: props.title ? <div className={"flex flex-col"}>
                <strong>{props.title}</strong>
                {message}
            </div> : message,
            variant: type,
            autoHideDuration
        })
    }, []);

    const close = useCallback(() => {
        closeSnackbar();
    }, []);

    return useMemo(() => ({
        open,
        close
    }), [open, close]);

};
