import { ReferenceProperty, } from "@camberi/firecms";
import { PropertyBuilderProps } from "../models";
import { findCommonInitialStringInPath } from "../util";

export function buildReferenceProperty({
                                        totalDocsCount,
                                        valuesResult
                                    }: PropertyBuilderProps): ReferenceProperty {

    const property: ReferenceProperty = {
        dataType: "reference",
        path: findCommonInitialStringInPath(valuesResult) ?? "!!!FIX_ME!!!"
    };

    return property;
}
