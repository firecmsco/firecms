import * as React from "react";
import clsx from "clsx";
import { Backdrop, Modal, Paper, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
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

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => createStyles({
    /* Styles applied to the root element. */
    root: {},
    /* Styles applied to the `Paper` component. */
    paper: {
        height: "100%",
        WebkitOverflowScrolling: "touch", // Add iOS momentum scrolling.
        position: "fixed",
        outline: 0
    },
    paperAnchorRight: ({ offsetPosition }) => ({
        left: "auto",
        right: 0
    }),
    /* Styles applied to the `Modal` component. */
    modal: {}
}));


const defaultTransitionDuration = {
    enter: 225,
    exit: 175
};

/**
 * The props of the [Modal](/api/modal/) component are available
 * when `variant="temporary"` is set.
 */
export const EntityDrawer = React.forwardRef<HTMLDivElement, EntityDrawerProps>(function EntityDrawer(props, ref) {

    const {
        children,
        onClose,
        open,
        offsetPosition,
        onExitAnimation
    } = props;

    const classes = useStyles({ offsetPosition });

    const drawer = (
        <Paper
            elevation={1}
            square
            style={{
                transition: "transform 1000ms cubic-bezier(0.33, 1, 0.68, 1)",
                transform: `translateX(-${(offsetPosition) * 240}px)`
            }}
            className={clsx(
                classes.paper,
                classes.paperAnchorRight
            )}
        >
            {children}
        </Paper>
    );


    const slidingDrawer = (
        <SlideFade
            in={open}
            timeout={defaultTransitionDuration}
            onExitAnimation={onExitAnimation}
        >
            {drawer}
        </SlideFade>
    );

    return (
        <Modal
            BackdropProps={{
                transitionDuration: defaultTransitionDuration
            }}
            BackdropComponent={Backdrop}
            className={clsx(classes.root, classes.modal)}
            open={open}
            onClose={onClose}
            ref={ref}
            keepMounted={true}
            // disableEnforceFocus related to https://github.com/Camberi/firecms/issues/50
            disableEnforceFocus={true}
        >
            {slidingDrawer}
        </Modal>
    );
});


