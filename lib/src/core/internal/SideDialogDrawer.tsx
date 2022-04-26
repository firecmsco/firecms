import React from "react";
import { Backdrop, Modal, Paper } from "@mui/material";
import { SlideFade } from "./SlideFadeTransition";

export interface EntityDrawerProps {

    /**
     * The contents of the drawer.
     */
    children: React.ReactNode,

    /**
     * Callback fired when the component requests to be closed.
     *
     * @param {object} event The event source of the callback.
     */
    onClose?: () => void,

    /**
     * If `true`, the drawer is open.
     */
    open: boolean,

    /**
     * The offset position of this view determines if it needs to be translated
     * when nested
     */
    offsetPosition: number;

    onExitAnimation?: () => void;

}

export interface StyleProps {
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
export const SideDialogDrawer = React.forwardRef<HTMLDivElement, EntityDrawerProps>(function EntityDrawer(props, ref) {

    const {
        children,
        onClose,
        open,
        offsetPosition,
        onExitAnimation
    } = props;

    return (
        <Modal
            BackdropProps={{
                transitionDuration: defaultTransitionDuration
            }}
            BackdropComponent={Backdrop}
            open={open}
            onClose={onClose}
            ref={ref}
            keepMounted={true}
            // disableEnforceFocus related to https://github.com/Camberi/firecms/issues/50
            disableEnforceFocus={true}
            sx={{
                transition: "transform 200ms cubic-bezier(0.33, 1, 0.68, 1)",
                transform: `translateX(-${(offsetPosition) * 240}px)`,
            }}
        >
            <SlideFade
                in={open}
                timeout={defaultTransitionDuration}
                onExitAnimation={onExitAnimation}
            >
                <Paper
                    elevation={1}
                    square
                    sx={{
                        height: "100%",
                        WebkitOverflowScrolling: "touch", // Add iOS momentum scrolling.
                        position: "fixed",
                        outline: 0,
                        left: "auto",
                        right: 0
                    }}
                >
                    {children}
                </Paper>
            </SlideFade>
        </Modal>
    );
});
