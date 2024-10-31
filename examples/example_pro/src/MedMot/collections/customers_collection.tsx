import { buildCollection, buildEnumValueConfig, Entity, EnumValues, FireCMSContext, Permissions } from "@firecms/core";
import { exerciseTypes } from "./exercises";
import BodyPartsField from "./fields/body/BodyPartsField";
import BodyPartsPreview from "./fields/body/BodyPartsPreview";
import { CopyMovementsAction } from "./actions/CopyMovementsAction";
import { bodyPartsEnum } from "./fields/body/body_parts";
import { exerciseSubtypes } from "./exercise_collection";

function buildCustomersRestrictions() {

    let forbiddenJointsCollection = buildCollection({
        name: "Restricted joint movements",
        id: "restricted_joint_movements",
        path: "restricted_joint_movements",
        singularName: "Restricted joint movement",
        properties: {
            joint: {
                name: "Joint",
                dataType: "reference",
                path: "medico/v2.0.0/joints"
            },
            related_movements: ({ values }) => (
                {
                    dataType: "array",
                    disabled: !values.joint,
                    name: "Related movements",
                    of: {
                        dataType: "map",
                        properties: {
                            movement: {
                                name: "Movement",
                                dataType: "reference",
                                // @ts-ignore
                                path: values.joint?.path ? values.joint.path + "/" + values.joint.id + "/movements" : undefined,
                                validation: { required: true }
                            },
                            maximal_allowed_extent: {
                                name: "Maximal allowed extent",
                                dataType: "number"
                            },
                            enforced_allowed: {
                                name: "Enforced allowed",
                                dataType: "boolean"
                            }
                        }
                    }
                }),
        },
        additionalFields: [{
            key: "copy_movements",
            name: "Copy to mirror",
            dependencies: ["joint", "related_movements"],
            Builder: ({ entity, context }: {
                entity: Entity<any>;
                context: FireCMSContext;
            }) => {
                return <CopyMovementsAction entity={entity}
                                            context={context}/>;
            }
        }]
    });
    return buildCollection({
        id: "restrictions",
        path: "restrictions",
        defaultSize: "s",
        name: "Restrictions",
        properties: {
            restriction_start_date: {
                name: "Restriction start date",
                dataType: "date"
            },
            restriction_duration: {
                name: "Restriction duration",
                dataType: "number",
                description: "Restriction duration in weeks"
            },
            restricted_exercise_types: {
                name: "Restricted exercise types",
                dataType: "array",
                of: {
                    dataType: "string",
                    enumValues: exerciseTypes
                }
            },
            restricted_exercise_subtype: {
                name: "Restricted exercise subtype",
                dataType: "string",
                enumValues: exerciseSubtypes
            },
            restricted_main_and_side_effect_body_parts: {
                name: "Restricted main and side effect body parts",
                dataType: "array",
                Field: BodyPartsField,
                customProps: {
                    mapped: false,
                    mirroring: true,
                    multiSelect: true
                },
                Preview: BodyPartsPreview,
                description:
                    "An exercise has one main effects (exercise type) on different parts of the body simultaneously.",
                of: {
                    dataType: "string",
                    enumValues: bodyPartsEnum
                }
            },
            restricted_main_effect_body_parts: {
                name: "Restricted main effect body parts",
                dataType: "array",
                Field: BodyPartsField,
                customProps: {
                    mapped: false,
                    mirroring: true,
                    multiSelect: true
                },
                Preview: BodyPartsPreview,
                description:
                    "An exercise has one main effects (exercise type) on different parts of the body simultaneously.",
                of: {
                    dataType: "string",
                    enumValues: bodyPartsEnum
                }
            },
            restricted_exercises: {
                name: "Restricted exercises",
                dataType: "array",
                of: {
                    name: "Exercises",
                    dataType: "reference",
                    path: "exercises"
                }
            },
            restricted_starting_positions: {
                name: "Restricted starting positions",
                dataType: "array",
                of: {
                    name: "Starting position",
                    dataType: "reference",
                    path: "starting_positions"
                }
            },
            restricted_loaded_body_parts: {
                name: "Restricted loaded body parts",
                dataType: "array",
                Field: BodyPartsField,
                customProps: {
                    mapped: false,
                    mirroring: true,
                    multiSelect: true
                },
                Preview: BodyPartsPreview,
                description:
                    "An exercise has one main effects (exercise type) on different parts of the body simultaneously.",
                of: {
                    dataType: "string",
                    enumValues: bodyPartsEnum
                }
            },
            restricted_joints: {
                name: "Restricted joints",
                dataType: "array",
                of: {
                    name: "Joint",
                    dataType: "reference",
                    path: "medico/v2.0.0/joints"
                }
            },
            comments: {
                name: "Comments",
                dataType: "string"
            }
        }
        ,
        singularName: "Restriction",
        subcollections: [
            forbiddenJointsCollection
        ]
    });
}

export function buildCustomersCollection() {

    return buildCollection({
        id: "customer",
        path: "customer",
        name: "Customers",
        singularName: "Customer",
        icon: "Person",
        initialSort: ["created_at", "desc"],
        customId: true,
        properties: {
            created_at: {
                dataType: "date",
                name: "Created At",
            },
            active: {
                dataType: "boolean",
                name: "Active",
                description: "Whether the customer is active or not",
                readOnly: true,
            },
            analytics_id: {
                dataType: "string",
                name: "Analytics ID",
                description: "Analytics ID",
                readOnly: true,
            },
            customer_type: {
                name: "Customer type",
                dataType: "string",
                readOnly: true,
            },
            goal: {
                name: "Goal",
                dataType: "string",
                readOnly: true,
            },
            work_mode: {
                name: "Work mode",
                dataType: "string",
                readOnly: true,

            },
            pain_info: {
                name: "Pain Info",
                dataType: "map",
                readOnly: true,
                keyValue: true
            },
            registration_context: {
                name: "Registration context",
                dataType: "map",
                readOnly: true,
                keyValue: true
            },
            current_diagnosis: {
                name: "Current diagnosis",
                dataType: "array",
                of: {
                    dataType: "string",
                    name: "Diagnosis",
                    description: "Diagnosis",
                    readOnly: true,
                },
                readOnly: true,
            },
            past_diagnosis: {
                name: "Past diagnosis",
                dataType: "array",
                of: {
                    dataType: "string",
                    name: "Diagnosis",
                    description: "Diagnosis",
                    readOnly: true,
                },
                readOnly: true,
            },
            send_notifications: {
                dataType: "boolean",
                name: "Send notification",
                readOnly: true,
            },
            number_of_exercises: {
                dataType: "number",
                name: "Number of exercises",
                readOnly: true,

            }
        },
        group: "Core",
        textSearchEnabled: true,
        subcollections: [
            buildCustomersRestrictions(),
        ]
    });
}

const generalRestrictionType: EnumValues = {
    absolute: buildEnumValueConfig({
        id: "absolute",
        label: "Absolute",
        color: "blueDark"
    }),
    relative: buildEnumValueConfig({
        id: "relative",
        label: "Relative",
        color: "greenLighter"
    })
};

const diseaseStateTypes: EnumValues = {
    acute: buildEnumValueConfig({
        id: "acute",
        label: "Acute"
    }),
    subacute: buildEnumValueConfig({
        id: "subacute",
        label: "Subacute"
    }),
    chronic: buildEnumValueConfig({
        id: "chronic",
        label: "Chronic"
    })
};
