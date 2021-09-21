import React, { useEffect } from "react";
import { useFormikContext } from "formik";

export const ErrorFocus = ({ containerRef }:
                               { containerRef?: React.RefObject<HTMLDivElement> }) => {
    const { isSubmitting, isValidating, errors } = useFormikContext();

    useEffect(() => {
        const keys = Object.keys(errors);

        // Whenever there are errors and the form is submitting but finished validating.
        if (keys.length > 0 && isSubmitting && !isValidating) {
            const errorElement = containerRef?.current?.querySelector<HTMLDivElement>(
                `#form_field_${keys[0]}`
            );

            if (errorElement && containerRef?.current) {
                const scrollableParent = getScrollableParent(containerRef.current);
                if (scrollableParent) {
                    const top = errorElement.getBoundingClientRect().top;
                    scrollableParent.scrollTo({
                        top: scrollableParent.scrollTop + top - 64,
                        behavior: "smooth"
                    });
                }
                const input = errorElement.querySelector("input");
                if (input) input.focus();
            }
        }
    }, [isSubmitting, isValidating, errors]);

    // This component does not render anything by itself.
    return null;
};

const isScrollable = (ele: HTMLElement | null) => {
    const hasScrollableContent = ele && ele.scrollHeight > ele.clientHeight;

    const overflowYStyle = ele ? window.getComputedStyle(ele).overflowY : null;
    const isOverflowHidden = overflowYStyle && overflowYStyle.indexOf("hidden") !== -1;

    return hasScrollableContent && !isOverflowHidden;
};

const getScrollableParent = (ele: HTMLElement | null): HTMLElement | null => {
    return (!ele || ele === document.body)
        ? document.body
        : (isScrollable(ele) ? ele : getScrollableParent(ele.parentNode as HTMLElement));
};
