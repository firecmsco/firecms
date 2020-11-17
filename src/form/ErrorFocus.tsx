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
                console.debug("Scrolling to error", keys[0]);
                containerRef.current.scrollTo({
                    top: containerRef.current?.scrollTop + errorElement.getBoundingClientRect().top - 64,
                    behavior: "smooth"
                });
                const input = errorElement.querySelector("input");
                if (input) input.focus();
            }
        }
    }, [isSubmitting, isValidating, errors]);

    // This component does not render anything by itself.
    return null;
};
