import {
    ReferenceProperty,
} from "@camberi/firecms";
import {PropertyBuilderProps, ValuesCountEntry} from "../models";
import {findCommonInitialStringInPath, unslugify} from "../util";

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
