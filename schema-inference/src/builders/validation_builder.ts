import {PropertyValidationSchema} from "@camberi/firecms";
import {PropertyBuilderProps} from "../models";

export function buildValidation({
                                    totalDocsCount,
                                    valuesResult
                                }: PropertyBuilderProps): PropertyValidationSchema | undefined {

    if (valuesResult) {
        const totalEntriesCount = valuesResult.values.length;
        if (totalDocsCount === totalEntriesCount)
            return {
                required: true
            }
    }

    return undefined;
}
