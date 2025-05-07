import { InferencePropertyBuilderProps } from "../types";
import { PropertyValidationSchema } from "../cms_types";

export function buildValidation({
                                    totalDocsCount,
                                    valuesResult
                                }: InferencePropertyBuilderProps): PropertyValidationSchema | undefined {

    if (valuesResult) {
        const totalEntriesCount = valuesResult.values.length;
        if (totalDocsCount === totalEntriesCount)
            return {
                required: true
            }
    }

    return undefined;
}
