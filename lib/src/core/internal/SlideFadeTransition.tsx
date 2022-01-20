import * as React from "react";
import { Transition } from "react-transition-group";
import { debounce, ownerWindow, useForkRef, useTheme } from "@mui/material";

// Translate the node so it can't be seen on the screen.
// Later, we're going to translate the node back to its original location with `none`.
function getTranslateValue(node: any) {
    const rect = node.getBoundingClientRect();
    const containerWindow = ownerWindow(node);
    let transform;

    if (node.fakeTransform) {
        transform = node.fakeTransform;
    } else {
        const computedStyle = containerWindow.getComputedStyle(node);
        transform =
            computedStyle.getPropertyValue("-webkit-transform") ||
            computedStyle.getPropertyValue("transform");
    }

    let offsetX = 0;

    if (transform && transform !== "none" && typeof transform === "string") {
        const transformValues = transform.split("(")[1].split(")")[0].split(",");
        offsetX = parseInt(transformValues[4], 10);
    }

    return `translateX(${containerWindow.innerWidth}px) translateX(${offsetX - rect.left}px)`;
}

export function setTranslateValue(node: any) {
    const transform = getTranslateValue(node);

    if (transform) {
        node.style.webkitTransform = transform;
        node.style.transform = transform;
    }
}

/**
 * The Slide transition is used by the [Drawer](/components/drawers/) component.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
export const SlideFade = React.forwardRef(function SlideFade(props: SlideProps, ref) {
    const {
        children,
        in: inProp,
        timeout,
        onExitAnimation,
        ...other
    } = props;

    const theme: any = useTheme();
    const childrenRef = React.useRef<any>(null);
    const handleRefIntermediary = useForkRef(children.ref, childrenRef);
    const handleRef = useForkRef(handleRefIntermediary, ref);

    const normalizedTransitionCallback = (callback: any) => (isAppearing: boolean) => {
        if (callback) {
            // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
            if (isAppearing === undefined) {
                callback(childrenRef.current);
            } else {
                callback(childrenRef.current, isAppearing);
            }
        }
    };

    const handleEnter = normalizedTransitionCallback((node: any) => {
        setTranslateValue(node);
        reflow(node);
    });

    const handleEntering = normalizedTransitionCallback((node: any) => {
        const transitionProps = getTransitionProps(
            { timeout },
            {
                mode: "enter"
            }
        );
        node.style.webkitTransition = theme.transitions.create("-webkit-transform", {
            ...transitionProps,
            easing: theme.transitions.easing.easeOut
        });

        node.style.transition = theme.transitions.create("transform", {
            ...transitionProps,
            easing: theme.transitions.easing.easeOut
        });

        node.style.webkitTransform = "none";
        node.style.transform = "none";
        node.style.opacity = 1;
    });


    const handleExit: any = normalizedTransitionCallback((node: any) => {
        const transitionProps = getTransitionProps(
            { timeout },
            {
                mode: "exit"
            }
        );

        node.style.opacity = 0.5;
        node.style.webkitTransition = theme.transitions.create(["-webkit-transform", "opacity"], {
            ...transitionProps,
            easing: theme.transitions.easing.sharp
        });

        node.style.transition = theme.transitions.create(["transform", "opacity"], {
            ...transitionProps,
            easing: theme.transitions.easing.sharp
        });

        setTranslateValue(node);
    });

    const handleExited: any = normalizedTransitionCallback((node: any) => {
        // No need for transitions when the component is hidden
        node.style.webkitTransition = "";
        node.style.transition = "";

    });

    const updatePosition = React.useCallback(() => {
        if (childrenRef.current) {
            setTranslateValue(childrenRef.current);
        }
    }, []);

    React.useEffect(() => {
        // Skip configuration where the position is screen size invariant.
        if (inProp) {
            return undefined;
        }

        const handleResize = debounce(() => {
            if (childrenRef.current) {
                setTranslateValue(childrenRef.current);
            }
        });

        const containerWindow = ownerWindow(childrenRef.current);
        containerWindow.addEventListener("resize", handleResize);
        return () => {
            handleResize.clear();
            containerWindow.removeEventListener("resize", handleResize);
        };
    }, [inProp]);

    React.useEffect(() => {
        if (!inProp) {
            // We need to update the position of the drawer when the direction change and
            // when it's hidden.d
            updatePosition();
        }
    }, [inProp, updatePosition]);

    return (
        <Transition
            nodeRef={childrenRef}
            onEnter={handleEnter}
            onEntering={handleEntering}
            onExit={handleExit}
            onExited={handleExited}
            appear={true}
            in={inProp}
            timeout={timeout}
            {...other}
        >
            {(state: any, childProps: any) => {
                return React.cloneElement(children, {
                    ref: handleRef,
                    style: {
                        visibility: state === "exited" && !inProp ? "hidden" : undefined,
                        ...children.props.style
                    },
                    ...childProps
                });
            }}
        </Transition>
    );
});


interface SlideProps {
    /**
     * A single child content element.
     */
    children: any;
    /**
     * If `true`, the component will transition in.
     */
    in: boolean;
    /**
     * The duration for the transition, in milliseconds.
     * You may specify a single timeout for all transitions, or individually with an object.
     * @default {
     *   enter: duration.enteringScreen,
     *   exit: duration.leavingScreen,
     * }
     */
    timeout: { enter: number, exit: number };

    onExitAnimation?: () => void;
}

const reflow = (node: any) => node.scrollTop;

function getTransitionProps(props: any, options: any) {
    const { timeout } = props;

    return {
        duration:
            typeof timeout === "number"
                ? timeout
                : timeout[options.mode] || 0
    };
}
