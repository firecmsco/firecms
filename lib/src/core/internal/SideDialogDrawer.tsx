import React from "react";
import { Modal, Paper, Slide, useTheme } from "@mui/material";

export interface SideDialogDrawerProps {

    /**
     * The contents of the drawer.
     */
    children: React.ReactNode,

    /**
     * Callback fired when the component requests to be closed.
     */
    onClose?: (force: boolean) => void,

    /**
     * If `true`, the drawer is open.
     */
    open: boolean,

    /**
     * The offset position of this view determines if it needs to be translated
     * when nested
     */
    offsetPosition: number;

}

const defaultTransitionDuration = {
    enter: 225,
    exit: 175
};

/**
 * The props of the [Modal](/api/modal/) component are available
 * when `variant="temporary"` is set.
 */
export const SideDialogDrawer = React.forwardRef<HTMLDivElement, SideDialogDrawerProps>(function EntityDrawer(props, ref) {

    const {
        children,
        onClose,
        open,
        offsetPosition
    } = props;

    const theme = useTheme();
    return (
        <Modal
            open={open}
            onClose={onClose ? () => onClose(false) : undefined}
            ref={ref}
            keepMounted={true}
            disableEnforceFocus={true}
            disableEscapeKeyDown={true}
            className="transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${offsetPosition * 200}px)` }}
        >
            <Slide
                in={open}
                timeout={defaultTransitionDuration}
                direction={"left"}
            >
                <Paper
                    variant={"outlined"}
                    square
                    className="h-full fixed right-0 overflow-hidden rounded-l-lg"
                    style={{ WebkitOverflowScrolling: 'touch', outline: 0 }}
                >
                    {children}
                </Paper>
            </Slide>
        </Modal>
    );
});
