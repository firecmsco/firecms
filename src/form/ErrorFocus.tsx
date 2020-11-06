import React, { useEffect } from "react";
import { useFormikContext } from "formik";

export const ErrorFocus = ({ containerRef }:
                               { containerRef?: React.RefObject<HTMLDivElement> }) => {
    // Get the context for the Formik form this component is rendered into.
    const { isSubmitting, isValidating, errors } = useFormikContext();

    useEffect(() => {
        // Get all keys of the error messages.
        const keys = Object.keys(errors);
        // Whenever there are errors and the form is submitting but finished validating.
        if (keys.length > 0 && isSubmitting && !isValidating) {
            const errorElement = containerRef?.current?.querySelector<HTMLDivElement>(
                `#form_field_${keys[0]}`
            );

            if (errorElement && containerRef?.current) {
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
