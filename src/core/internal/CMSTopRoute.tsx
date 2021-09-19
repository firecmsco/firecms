import * as React from "react";
import { useMatch, useResolvedPath } from "react-router";
import { Transition } from "react-transition-group";

const duration = 2000;

const defaultStyle = {
    height: "100%",
    width: "100%",
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0
};

const transitionStyles = {
    entering: { opacity: 1 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 }
};

export const CMSTopRoute = ({ path, element } : any) => {
    const resolvedPath = useResolvedPath(path);
    const match = useMatch(resolvedPath.pathname);
    return (
        <Transition
            in={match != null}
            unmountOnExit
            timeout={duration}>
            {state => (
                <div style={{
                    ...defaultStyle,
                    ...transitionStyles[state]
                }}>
                    YOOOOO
                    {element}
                </div>
            )}
        </Transition>
    );
}
