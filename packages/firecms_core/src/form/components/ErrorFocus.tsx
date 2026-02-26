import React, { useEffect, useRef } from "react";
import { useFormex } from "@firecms/formex";

export const ErrorFocus = ({ containerRef }:
    {
        containerRef?: React.RefObject<HTMLDivElement | null>
    }) => {
    const {
        isValidating,
        errors,
        version
    } = useFormex();

    const prevVersion = useRef(version);

    useEffect(() => {

        if (version === prevVersion.current) {
            return;
        }

        const keys = Object.keys(errors);

        // Whenever there are errors and the form has been submitted and is not validating
        if (!isValidating && keys.length > 0) {
            const errorElement = containerRef?.current?.querySelector<HTMLDivElement>(
                `#form_field_${keys[0]}`
            );

            if (errorElement) {
                errorElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
                const input = errorElement.querySelector("input");
                if (input) input.focus();
            }
            prevVersion.current = version;
        }
    }, [isValidating, errors, containerRef, version]);

    // This component does not render anything by itself.
    return null;
};
