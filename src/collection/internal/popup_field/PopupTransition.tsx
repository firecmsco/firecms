import * as React from "react";
import { Transition } from "react-transition-group";
import { useForkRef, useTheme } from "@mui/material";


interface PopupTransitionProps {
    /**
     * A single child content element.
     */
    children: any,
    /**
     * If `true`, show the component; triggers the enter or exit animation.
     */
    in: boolean,
    /**
     * The duration for the transition, in milliseconds.
     * You may specify a single timeout for all transitions, or individually with an object.
     *
     */
    timeout?: number,

    sourceRect?: DOMRect;

    boundingRect?: DOMRect;

}


function getScale(value: number) {
    return `scale(${value}, ${value ** 2})`;
}

const styles = {
    entering: {
        opacity: 1,
        transform: getScale(1)
    },
    entered: {
        opacity: 1,
        transform: "none"
    }
};

/**
 * Meant to animate the popup from the cell starting point, but it doesn't work
 */
export const PopupTransition = React.forwardRef(function PopupTransition(props: PopupTransitionProps, ref: React.ForwardedRef<any>) {

    const {
        children,
        in: inProp,
        timeout,
        sourceRect,
        boundingRect
    } = props;

    const timer = React.useRef();
    const theme = useTheme();

    const foreignRef = useForkRef(children.ref, ref);
    const handleRef = useForkRef(undefined as any, foreignRef);

    const handleEnter = (node: HTMLElement) => {

        const duration = timeout ?? 1000;
        const delay = 0;

        node.style.transition = [
            theme.transitions.create("opacity", {
                duration,
                delay
            }),
            theme.transitions.create("transform", {
                duration: duration * 0.666,
                delay
            })
        ].join(",");

    };

    const handleExit = (node: HTMLElement) => {

        const duration = timeout ?? 1000;
        const delay = 0;

        node.style.transition = [
            theme.transitions.create("opacity", {
                duration,
                delay
            }),
            theme.transitions.create("transform", {
                duration: duration * 0.666,
                delay: delay || duration * 0.333
            })
        ].join(",");

        node.style.opacity = "0";
        node.style.transform = getScale(0.75);
    };

    React.useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);

    const initialTranslate = sourceRect && boundingRect ?
        `${sourceRect.left - boundingRect.left}px, ${sourceRect.top - boundingRect.top}px` :
        `0px, 0px`;

    return (
        <Transition
            appear
            mountOnEnter={true}
            in={inProp}
            addEndListener={() => {
            }}
            onEnter={handleEnter}
            onExit={handleExit}
            timeout={timeout}
        >
            {(state: any, childProps: any) => {
                return React.cloneElement(children, {
                    style: {
                        opacity: 0.5,
                        transform: `translate(${initialTranslate}) scale(0.2)`,
                        visibility: state === "exited" && !inProp ? "hidden" : undefined,
                        ...styles[state],
                        ...children.props.style
                    },
                    ref: handleRef,
                    ...childProps
                });
            }}
        </Transition>
    );
});
