import { PropertyValidationSchema } from "@firecms/core";
import { InferencePropertyBuilderProps } from "../types";

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
