import { EntityReference, FieldProps } from "@firecms/core";
import { ExerciseReferenceWidget } from "./ExerciseReferenceWidget";
import { FormControl } from "./FormControl";
import { Typography } from "@firecms/ui";




export default function ExerciseRelatedField({

    property,
    value,
    setValue,
    error,
    isSubmitting,
    showError,
}: FieldProps<any>) {

    const validValue = value && value instanceof EntityReference;
    const path = validValue ? value.path : property.path;

    return (
        <FormControl
            required={property.validation?.required}
            error={showError}
            disabled={isSubmitting}
            fullWidth>

            <Typography variant={"caption"}  required={property.validation?.required}>
                {property.title || name}
            </Typography>

            <ExerciseReferenceWidget name={property.name}
                path={path}
                property={property}
                forceFilter={property.forceFilter}
                previewProperties={property.previewProperties}
                value={value}
                disabled={Boolean(property.disabled)}
                setValue={setValue} />


            {showError && <Typography variant={"caption"} color={"error"}
                id="component-error-text">{error}</Typography>}

            {property.description &&
                <Typography variant={"caption"}>{property.description}</Typography>}

        </FormControl>
    )


}
