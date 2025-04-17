import React, { useCallback, useEffect, useRef, useState } from "react";
import { defaultBorderMixin } from "./partials/styles";

const DropdownPanelContent = ({ children }: {
    children?: React.ReactNode;
}) => {
    return (
        <div className={"relative max-w-full w-[84rem] mx-auto px-4 py-5 pl-[80px]" }>
            {children}
        </div>
    );
};

const NavigationDropdown = ({
                                trigger,
                                children,
                                dropdownClassName = ""
                            }: {
    trigger: React.ReactNode;
    children: React.ReactNode;
    dropdownClassName?: string;
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [leftOffset, setLeftOffset] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const calculateOffset = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setLeftOffset(rect.left);
            }
        }
        if (isVisible) {
            calculateOffset();
            window.addEventListener("resize", calculateOffset);
            window.addEventListener("scroll", calculateOffset, true);
        }

        return () => {
            window.removeEventListener("resize", calculateOffset);
            window.removeEventListener("scroll", calculateOffset, true);
        }
    }, [isVisible]);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleMouseEnter = useCallback(() => {
        clearTimer();
        if (!isVisible) {
            setIsVisible(true);
        }
    }, [clearTimer, isVisible]);

    const handleMouseLeave = useCallback(() => {
        clearTimer();
        timerRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150);
    }, [clearTimer]);

    const handleFocus = useCallback(() => {
        clearTimer();
        if (!isVisible) {
            setIsVisible(true);
        }
    }, [clearTimer, isVisible]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            clearTimer();
            timerRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 150);
        }
    }, [clearTimer]);

    useEffect(() => {
        return () => {
            clearTimer();
        };
    }, [clearTimer]);

    return (
        <div
            ref={containerRef}
            className={"relative inline-block "}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            {trigger}

            <div
                className={`absolute top-full left-0 w-screen bg-gray-900 shadow-lg z-50 transition-opacity duration-150 ease-in-out ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"} ${dropdownClassName} border-b ` + defaultBorderMixin}
                style={{ transform: `translateX(-${leftOffset}px) translateY(24px)` }}
                role="region"
                aria-label="Additional Information"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <DropdownPanelContent>
                    {children}
                </DropdownPanelContent>
            </div>
        </div>
    );
};

export default NavigationDropdown;
