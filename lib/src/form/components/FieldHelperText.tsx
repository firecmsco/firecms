import { ResolvedProperty } from "../../types";
import { FieldDescription } from "./FieldDescription";
import { Typography } from "../../components";

/**
 * Component in charge of rendering the description of a field
 * as well as the error message if any.
 *
 * @param error
 * @param showError
 * @param property
 * @param includeDescription
 * @constructor
 */
export function FieldHelperText({
                                    error,
                                    showError,
                                    property,
                                    includeDescription = true
                                }: {
                                    error: string,
                                    showError: boolean,
                                    property: ResolvedProperty,
                                    includeDescription?: boolean
                                }
) {

    const hasDescription = property.description || property.longDescription;

    if (!error && (!includeDescription || !hasDescription))
        return null;

    if (showError && error) {
        return <Typography variant={"caption"}
                           className={"ml-3.5 text-red-500"}>
            {error}
        </Typography>
    }

    return <div className={"ml-3.5 mt-1"}>
        {includeDescription && hasDescription &&
            <FieldDescription property={property}/>}
    </div>
}
