import React, { useEffect, useRef, useState } from "react";

import { CloseIcon, IconButton, TextField } from "@firecms/ui";
import { FieldProps, GeoPoint } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { PropertyIdCopyTooltip } from "../../components";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { getIconForProperty } from "../../util";
import { formatGeoPoint, getGeoPointCoordinates, parseGeoPoint } from "../../util/geopoint";

interface GeopointFieldBindingProps extends FieldProps<GeoPoint> {
}

export function GeopointFieldBinding({
                                          propertyKey,
                                          value,
                                          setValue,
                                          error,
                                          showError,
                                          disabled,
                                          autoFocus,
                                          property,
                                          includeDescription,
                                          size = "large"
                                      }: GeopointFieldBindingProps) {

    const coordinates = getGeoPointCoordinates(value);
    const canClear = Boolean((property as any).clearable);
    const [latitude, setLatitude] = useState<string>(coordinates ? coordinates.latitude.toString() : "");
    const [longitude, setLongitude] = useState<string>(coordinates ? coordinates.longitude.toString() : "");
    const [localError, setLocalError] = useState<string | undefined>();
    const skipSyncRef = useRef(false);

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    useEffect(() => {
        if (skipSyncRef.current) {
            skipSyncRef.current = false;
            return;
        }
        const nextCoordinates = getGeoPointCoordinates(value);
        setLatitude(nextCoordinates ? nextCoordinates.latitude.toString() : "");
        setLongitude(nextCoordinates ? nextCoordinates.longitude.toString() : "");
    }, [value]);

    const updateGeoPoint = (nextLatitude: string, nextLongitude: string) => {
        skipSyncRef.current = true;
        setLatitude(nextLatitude);
        setLongitude(nextLongitude);

        const trimmedLatitude = nextLatitude.trim();
        const trimmedLongitude = nextLongitude.trim();

        if (!trimmedLatitude && !trimmedLongitude) {
            setLocalError(undefined);
            setValue(null);
            return;
        }

        const parsed = parseGeoPoint(`${trimmedLatitude}, ${trimmedLongitude}`);

        if (parsed.error) {
            setLocalError(parsed.error);
            setValue(null);
            return;
        }

        setLocalError(undefined);
        setValue(parsed.point);
    };

    const handleClear = (event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        updateGeoPoint("", "");
    };

    const resolvedError = localError ?? error;
    const shouldShowError = Boolean(resolvedError) || Boolean(showError && error);

    return (
        <>
            <PropertyIdCopyTooltip propertyKey={propertyKey}>
                <div className="flex flex-col gap-2">
                    <div className="mt-1">
                        <LabelWithIcon
                            icon={getIconForProperty(property, "small")}
                            required={property.validation?.required}
                            title={property.name}
                            className={shouldShowError ? "text-red-500 dark:text-red-500" : "text-text-secondary dark:text-text-secondary-dark"}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <TextField
                            size={size}
                            value={latitude}
                            onChange={(event) => updateGeoPoint(event.target.value, longitude)}
                            autoFocus={autoFocus}
                            label={"Latitude"}
                            type="number"
                            disabled={disabled}
                            endAdornment={canClear ? (
                                <IconButton onClick={handleClear}>
                                    <CloseIcon />
                                </IconButton>
                            ) : undefined}
                            error={shouldShowError && Boolean(resolvedError)}
                        />
                        <TextField
                            size={size}
                            value={longitude}
                            onChange={(event) => updateGeoPoint(latitude, event.target.value)}
                            label={"Longitude"}
                            type="number"
                            disabled={disabled}
                            error={shouldShowError && Boolean(resolvedError)}
                        />
                    </div>
                    {value && !resolvedError && (
                        <div className="text-xs text-text-secondary dark:text-text-secondary-dark font-mono">
                            {formatGeoPoint(value)}
                        </div>
                    )}
                </div>
            </PropertyIdCopyTooltip>

            <FieldHelperText includeDescription={includeDescription}
                             showError={shouldShowError}
                             error={resolvedError}
                             disabled={disabled}
                             property={property}/>
        </>
    );
}
