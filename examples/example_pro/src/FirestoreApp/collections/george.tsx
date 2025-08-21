import {
    AdditionalFieldDelegate,
    buildCollection,
    Entity,
    EntityCollection,
    EntityPreviewContainer,
    EntityReference,
    FieldProps, ReferencePreview,
    useReferenceDialog
} from "@firecms/core";
// import { buildMarkdownSliceProperty } from "./slices";
import { cls, Icon } from "@firecms/ui";
// import { CommonPageAttributes } from '@naus-code/naus-content-cms-types';
// import { Optional } from '@naus-code/naus-config-types';

interface ExampleType {
    optionalMap?: {
        valueOne: string;
        valueTwo: number;
        nested?: {
            valueThree: string;
            valueFour: number;
        };
    };
    reference_obj: EntityReference;
}

const blogRecordId: AdditionalFieldDelegate = {
    key: "blog_record_id",
    name: "Blog Record Id",
    Builder: ({ entity }) => {
        //!props missing actual path of entity
        return entity.path;
    }
};

const Field = ({
                   context,
                   value,
                   setValue
               }: FieldProps<EntityReference, any>) => {
    // hook to open a reference dialog
    //!props missing actual path of entity
    console.log("aaa", {
        id: context.entityId,
        value
    });
    const collection = buildCollection<any>({
        id: "blog-page-selector",
        name: "Blog pages",
        path: "locales",
        collectionGroup: true,
        editable: false,
        forceFilter: {
            // collectionId: ["==", "blog"],
            // culture: ["==", context.entityId]
        },
        // initialSort: ["dateUpdated", "desc"],
        propertiesOrder: [
            //
            "name",
            "blog_record_id"
        ],
        //!Cannot see additional field when in reference dialog mode
        additionalFields: [blogRecordId],
        properties: {
            // blog_record_id: buildProperty(() => {
            //     return {
            //         dataType: 'string',
            //         name: 'Blog Record',
            //         Preview: (props) => {
            //             //!props missing actual path of entity
            //             // "collections/blog/records/10-…k-islands-authentic-escape/pages/default/drafts"
            //             // return path.split('/')[3];
            //             return '';
            //         },
            //         disabled: true,
            //     };
            // }),
            name: {
                dataType: "string",
                name: "Name",
                description: "Name of the blog page",
            }
        }
    });

    const referenceDialog = useReferenceDialog({
        path: "locales",
        collection,
        onSingleEntitySelected: (entity: Entity<any>) => {
            if (!entity?.id) {
                setValue(null);
            } else {
                setValue(new EntityReference(entity.id, entity.path));
            }
        }
    });

    if (value) {
        return (
            //!Reference preview automatically picking up collection properties from different collection with same path
            <ReferencePreview
                // disabled={!property.path}
                // previewProperties={property.previewProperties}
                // hover={!disabled}
                size={"small"}
                onClick={referenceDialog.open}
                reference={value}
                // includeEntityLink={property.includeEntityLink}
                // includeId={property.includeId}
            />
            // <EntityPreviewContainer
            //     className={cls("px-6 h-16 text-sm font-medium flex items-center gap-6")}
            //     onClick={referenceDialog.open}
            //     size={"medium"}
            // >
            //     <Icon iconKey="newspaper" color="success"/>
            //     {value ? `${value}` : "Edit feature blog"}
            // </EntityPreviewContainer>
        );
    }
    return (
        <EntityPreviewContainer
            className={cls("px-6 h-16 text-sm font-medium flex items-center gap-6")}
            onClick={referenceDialog.open}
            size={"medium"}
        >
            <Icon iconKey="newspaper" className={"text-surface-300 dark:text-surface-600"}/>
            {value ? `${value}` : "Edit feature blog"}
        </EntityPreviewContainer>
    );
};

export const TEST_COLLECTION: EntityCollection<any> = {
    id: "test",
    name: "Test",
    icon: "science",
    path: "test",
    customId: true,
    // alwaysApplyDefaultValues: true,
    subcollections: [
        {
            id: "TEST_records",
            path: "records",
            name: "Records",
            customId: true,
            subcollections: [
                {
                    id: "TEST_pages/default/drafts",
                    path: "pages/default/drafts",
                    name: "Drafs",
                    customId: true,
                    properties: {
                        text: {
                            dataType: "string",
                            name: "Text",
                            description: "Markdown text for the page",
                            markdown: true,
                        }
                    }
                }
            ],
            properties: {}
        },
        {
            id: "TEST_templates/default/drafts",
            path: "templates/default/drafts",
            name: "templates",
            customId: true,
            properties: {
                text: {
                    dataType: "string",
                    name: "Text",
                    description: "Markdown text for the page",
                    markdown: true,
                }
            }
        }
    ],
    properties: {
        name: {
            dataType: "string",
            name: "Name",
        },
        reference_obj: {
            //!Reference Datatype doesnt allow for custom Field props
            dataType: "reference",
            // path:"blog",
            // dataType: "string",
            name: "Blog page",
            Field: Field,
            hideFromCollection: true,
            defaultValue: null
        }
    }
};
