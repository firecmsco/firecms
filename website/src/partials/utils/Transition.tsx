import React, {useContext, useEffect, useRef} from "react";
import {CSSTransition as ReactCSSTransition} from "react-transition-group";

const TransitionContext = React.createContext<any>({
    parent: {}
});

function useIsInitialRender() {
    const isInitialRender = useRef(true);
    useEffect(() => {
        isInitialRender.current = false;
    }, []);
    return isInitialRender.current;
}

function CSSTransition({
                           show,
                           enter = "",
                           enterStart = "",
                           enterEnd = "",
                           leave = "",
                           leaveStart = "",
                           leaveEnd = "",
                           appear,
                           unmountOnExit,
                           tag = "div",
                           children,
                           ...rest
                       }) {
    const enterClasses = enter.split(" ").filter(s => s.length);
    const enterStartClasses = enterStart.split(" ").filter(s => s.length);
    const enterEndClasses = enterEnd.split(" ").filter(s => s.length);
    const leaveClasses = leave.split(" ").filter(s => s.length);
    const leaveStartClasses = leaveStart.split(" ").filter(s => s.length);
    const leaveEndClasses = leaveEnd.split(" ").filter(s => s.length);
    const removeFromDom = unmountOnExit;

    function addClasses(node, classes) {
        classes.length && node.classList.add(...classes);
    }

    function removeClasses(node, classes) {
        classes.length && node.classList.remove(...classes);
    }

    const nodeRef = React.useRef<HTMLElement>();
    const Component = tag as any;
    return (
        <ReactCSSTransition
            appear={appear}
            nodeRef={nodeRef}
            unmountOnExit={removeFromDom}
            in={show}
            addEndListener={(done) => {
                if (nodeRef.current)
                    nodeRef.current.addEventListener("transitionend", done, false);
            }}
            onEnter={() => {
                if (!removeFromDom && nodeRef.current) nodeRef.current.style.display = "";
                addClasses(nodeRef.current, [...enterClasses, ...enterStartClasses]);
            }}
            onEntering={() => {
                removeClasses(nodeRef.current, enterStartClasses);
                addClasses(nodeRef.current, enterEndClasses);
            }}
            onEntered={() => {
                removeClasses(nodeRef.current, [...enterEndClasses, ...enterClasses]);
            }}
            onExit={() => {
                addClasses(nodeRef.current, [...leaveClasses, ...leaveStartClasses]);
            }}
            onExiting={() => {
                removeClasses(nodeRef.current, leaveStartClasses);
                addClasses(nodeRef.current, leaveEndClasses);
            }}
            onExited={() => {
                removeClasses(nodeRef.current, [...leaveEndClasses, ...leaveClasses]);
                if (!removeFromDom && nodeRef.current) nodeRef.current.style.display = "none";
            }}
        >
            <Component
                ref={nodeRef}
                {...rest}
                style={{display: !removeFromDom ? "none" : null}}
            >
                {children}
            </Component>
        </ReactCSSTransition>
    );
}

function Transition({show, appear, ...rest}:
                        {
                            id: any;
                            show: boolean;
                            appear: boolean;
                            className: string;
                            enter: string;
                            enterStart: string;
                            enterEnd: string;
                            leave: string;
                            leaveStart: string;
                            leaveEnd: string;
                        } & any

) {
    const {parent} = useContext(TransitionContext);
    const isInitialRender = useIsInitialRender();
    const isChild = show === undefined;
    if (isChild) {
        return (
            <CSSTransition
                appear={parent.appear || !parent.isInitialRender}
                show={parent.show}
                {...rest}
            />
        );
    }
    return (
        <TransitionContext.Provider
            value={{
                parent: {
                    show,
                    isInitialRender,
                    appear
                }
            }}
        >
            <CSSTransition appear={appear} show={show} {...rest} />
        </TransitionContext.Provider>
    );
}

export default Transition;
