import { ArrayProperty, EntityRelation, PropertyPreviewProps, RelationProperty } from "@rebasepro/types";
import { RelationPreview } from "../components/RelationPreview";

/**
 * @group Preview components
 */
export function ArrayOfRelationsPreview({
    propertyKey,
    value,
    property,
    size
}: PropertyPreviewProps<ArrayProperty>) {

    if (Array.isArray(property?.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property?.type !== "array" || !property.of || property.of.type !== "relation")
        throw Error("Picked wrong preview component ArrayOfRelationsPreview");

    const ofProperty = property.of as RelationProperty;

    return (
        <div className="flex flex-col w-full gap-0.5">
            {value &&
                value.map((relation: any, index: number) => {
                    // Support both EntityRelation instances and plain objects with __type === "relation"
                    const entityRelation = (relation instanceof EntityRelation)
                        ? relation
                        : (relation && typeof relation === "object" && (relation.__type === "relation" || relation.isEntityRelation?.()))
                            ? new EntityRelation(relation.id, relation.path)
                            : null;

                    if (!entityRelation) return null;

                    return (
                        <div className="w-full"
                            key={`preview_array_rel_${propertyKey}_${index}`}>
                            <RelationPreview
                                disabled={!ofProperty.relation}
                                previewProperties={ofProperty.previewProperties}
                                size={"small"}
                                relation={entityRelation}
                                includeId={ofProperty.includeId}
                                includeEntityLink={ofProperty.includeEntityLink}
                            />
                        </div>
                    );
                })}
        </div>
    );
}
