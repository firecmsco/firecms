import React from "react";
import { Backdrop, Modal, Paper, Slide, useTheme } from "@mui/material";

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
            BackdropProps={{
                transitionDuration: defaultTransitionDuration,
                sx: {
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0.6)"
                }
            }}
            BackdropComponent={Backdrop}
            open={open}
            onClose={onClose ? () => onClose(false) : undefined}
            ref={ref}
            keepMounted={true}
            disableEnforceFocus={true}
            disableEscapeKeyDown={true}
            sx={{
                transition: `transform 300ms ${theme.transitions.easing.easeOut}`,
                transform: `translateX(-${(offsetPosition) * 200}px)`
            }}
        >
            <Slide
                in={open}
                timeout={defaultTransitionDuration}
                direction={"left"}
            >
                <Paper
                    variant={"outlined"}
                    square
                    sx={{
                        height: "100%",
                        WebkitOverflowScrolling: "touch", // Add iOS momentum scrolling.
                        position: "fixed",
                        outline: 0,
                        left: "auto",
                        right: 0,
                        overflow: "hidden",
                        borderRadius: "16px 0 0 16px"
                    }}
                >
                    {children}
                </Paper>
            </Slide>
        </Modal>
    );
});
