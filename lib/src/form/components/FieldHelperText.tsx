import { ResolvedProperty } from "../../types";
import { IconButton, Tooltip, Typography } from "../../components";

import { InfoIcon } from "../../icons";

/**
 * Component in charge of rendering the description of a field
 * as well as the error message if any.
 */
export function FieldHelperText({
                                    error,
                                    showError,
                                    property,
                                    includeDescription = true,
                                    disabled
                                }: {
                                    error: string,
                                    showError: boolean,
                                    property: ResolvedProperty,
                                    includeDescription?: boolean,
                                    disabled?: boolean,
                                }
) {

    const hasDescription = property.description || property.longDescription;

    if (!(showError && error) && (!includeDescription || !hasDescription))
        return null;

    if (showError && error) {
        return <Typography variant={"caption"}
                           className={"ml-3.5 text-red-500"}>
            {error}
        </Typography>
    }

    const disabledTooltip: string | undefined = typeof property.disabled === "object" ? property.disabled.disabledMessage : undefined;

    return <div className={"flex ml-3.5 mt-1"}>
        <Typography variant={"caption"}
                    color={disabled ? "disabled" : "secondary"}
                    className={"flex-grow"}>
            {disabledTooltip || property.description}
        </Typography>

        {property.longDescription &&
            <Tooltip title={property.longDescription}
                     placement="bottom"
            >
                <IconButton
                    size={"small"}
                    className="self-start">

                    <InfoIcon color={"disabled"}
                              size={"small"}/>
                </IconButton>
            </Tooltip>}

    </div>
}
