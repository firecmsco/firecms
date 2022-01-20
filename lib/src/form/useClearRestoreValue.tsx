import { useEffect, useRef } from "react";
import { CMSType, Property } from "../models";

/**
 * Hook we use to restore a value after it has been cleared
 * @param property
 * @param value
 * @param setValue
 * @ignore
 */
export function useClearRestoreValue<T extends CMSType>({
                                                            property,
                                                            value,
                                                            setValue
                                                        }:
                                                            {
                                                                property: Property<T>,
                                                                value: T,
                                                                setValue: (value: T | null, shouldValidate?: boolean) => void
                                                            }) {

    const clearedValueRef = useRef<T | null>(null);
    useEffect(() => {
        const shouldClearValueIfDisabled = typeof property.disabled === "object" && Boolean(property.disabled.clearOnDisabled);
        if (shouldClearValueIfDisabled) {
            if (value != null) {
                clearedValueRef.current = value;
                setValue(null);
            }
        } else if (clearedValueRef.current) {
            setValue(clearedValueRef.current);
            clearedValueRef.current = null;
        }
    }, [property]);
}
