import {
    buildEnumValueConfig,
    buildProperty,
    buildCollection,
    EntityReference,
    EnumValues,
    buildAdditionalFieldDelegate,
    AsyncPreviewComponent,
    Permissions,
    ExportMappingFunction,
    Entity, FireCMSContext, AdditionalFieldDelegate
} from "@firecms/core";
import { locales } from "./locales";
import { Exercise, exerciseTypes } from "./exercises";
import { collection, doc, getDoc, getFirestore } from "firebase/firestore";
// import MusclesPreview from "./fields/muscles/MusclesPreview";
import BodyPartsField from "./fields/body/BodyPartsField";
import BodyPartsPreview from "./fields/body/BodyPartsPreview";
import { CopyMovementsAction } from "./actions/CopyMovementsAction";
import { bodyPartsEnum } from "./fields/body/body_parts";


export type Diagnosis = {
    name: string,
    icd_10_code: string,
    replaced_by: EntityReference,
    legacy_id: string,
    enabled: boolean,
    created_at: Date,
    comment: string
}

const muscleStatus = new Map([
    ["-3", buildEnumValueConfig({
        id: "-3",
        label: "Strongly shortened",
        color: "redDarker"
    })],
    ["-2", buildEnumValueConfig({
        id: "-2",
        label: "Medium shortened",
        color: "redLight"
    })],
    ["-1", buildEnumValueConfig({
        id: "-1",
        label: "Lightly shortened",
        color: "redLighter"
    })],
    ["0", buildEnumValueConfig({
        id: "0",
        label: "Normal",
        color: "grayLight"
    })],
    ["1", buildEnumValueConfig({
        id: "1",
        label: "Lightly stretched",
        color: "blueLighter"
    })],
    ["2", buildEnumValueConfig({
        id: "2",
        label: "Medium stretched",
        color: "blueLight"
    })],
    ["3", buildEnumValueConfig({
        id: "3",
        label: "Strongly stretched",
        color: "blueDarker"
    })]
]);

const relaxedStatus = new Map([
    ["-3", buildEnumValueConfig({
        id: "-3",
        label: "Very tense",
        color: "redDarker"
    })],
    ["-2", buildEnumValueConfig({
        id: "-2",
        label: "Medium tense",
        color: "redLight"
    })],
    ["-1", buildEnumValueConfig({
        id: "-1",
        label: "Lightly tense",
        color: "redLighter"
    })],
    ["0", buildEnumValueConfig({
        id: "0",
        label: "Normal",
        color: "grayLight"
    })],
    ["1", buildEnumValueConfig({
        id: "1",
        label: "Lightly relaxed",
        color: "blueLighter"
    })],
    ["2", buildEnumValueConfig({
        id: "2",
        label: "Medium relaxed",
        color: "blueLight"
    })],
    ["3", buildEnumValueConfig({
        id: "3",
        label: "Very relaxed",
        color: "blueDarker"
    })]
]);

const activityStatus = new Map([
    ["-3", buildEnumValueConfig({
        id: "-3",
        label: "Very inactive",
        color: "redDarker"
    })],
    ["-2", buildEnumValueConfig({
        id: "-2",
        label: "Medium inactive",
        color: "redLight"
    })],
    ["-1", buildEnumValueConfig({
        id: "-1",
        label: "Lightly inactive",
        color: "redLighter"
    })],
    ["0", buildEnumValueConfig({
        id: "0",
        label: "Normal",
        color: "grayLight"
    })],
    ["1", buildEnumValueConfig({
        id: "1",
        label: "Lightly active",
        color: "blueLighter"
    })],
    ["2", buildEnumValueConfig({
        id: "2",
        label: "Medium active",
        color: "blueLight"
    })],
    ["3", buildEnumValueConfig({
        id: "3",
        label: "Very active",
        color: "blueDarker"
    })]
]);

function buildDiagnosisRestrictions() {
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
            restriction_type: {
                name: "Restriction type",
                validation: { required: true },
                dataType: "string",
                enumValues: generalRestrictionType
            },
            disease_state: {
                name: "Diseases state",
                validation: { required: true },
                dataType: "array",
                of: {
                    dataType: "string",
                    enumValues: diseaseStateTypes
                }
            },
            restricted_exercise_types: {
                name: "Restricted exercise types",
                dataType: "array",
                of: {
                    dataType: "string",
                    enumValues: exerciseTypes
                }
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

function buildDiagnosisMusclesCollection() {
    return buildCollection({
        id: "muscles",
        path: "muscles",
        defaultSize: "s",
        name: "Muscles",
        singularName: "Diagnosis muscle",
        properties: {
            muscle_id: {
                name: "Muscle",
                dataType: "number",
                columnWidth: 260,
                // Field: MusclesField,
                // Preview: MusclesPreview,
                validation: {
                    required: true
                }
            },
            length_status: {
                name: "Length status",
                dataType: "number",
                // @ts-ignore
                enumValues: muscleStatus,
                validation: {
                    required: true
                }
            },
            bending_stress_status: {
                name: "Bending stress status",
                dataType: "number",

                // @ts-ignore
                enumValues: relaxedStatus,
                validation: {
                    required: true
                }
            },
            tensile_tension_status: {
                name: "Tensile tension status",
                dataType: "number",

                // @ts-ignore
                enumValues: relaxedStatus,
                validation: {
                    required: true
                }
            },
            pressure_tension_status: {
                name: "Pressure tension status",
                dataType: "number",
                // @ts-ignore
                enumValues: relaxedStatus,
                validation: {
                    required: true
                }
            },
            activity_status: {
                name: "Activity status",
                dataType: "number",
                // @ts-ignore
                enumValues: activityStatus,
                validation: {
                    required: true
                }
            }
        }

    });
}

function buildDiagnosisLocaleCollection() {
    return buildCollection({
        id: "locales",
        path: "locales",
        defaultSize: "s",
        name: "Locales",
        singularName: "Locale",
        customId: locales,
        properties: {
            name: {
                name: "Name",
                dataType: "string",
                columnWidth: 360,
                validation: {
                    required: true
                }
            },
            synonyms: {
                name: "Synonyms",
                dataType: "array",
                of: {
                    dataType: "string",
                    validation: {
                        required: true
                    }
                },
                columnWidth: 360
            }
        }

    });
}

export function buildDiagnosisCollection() {

    const diagnosisGermanTitleColumn: AdditionalFieldDelegate = buildAdditionalFieldDelegate<Exercise>({
        key: "german_title",
        name: "German name",
        Builder: ({ entity, context }) => (
            <AsyncPreviewComponent
                builder={context.dataSource.fetchEntity({
                    path: entity.path + "/" + entity.id + "/locales",
                    entityId: "de-DE",
                    collection: buildDiagnosisLocaleCollection()
                }).then((entity) => (<>{entity?.values.name}</>))}
            />
        )
    });

    const sampleAdditionalExportColumn: ExportMappingFunction = {
        key: "german_name",
        builder: async ({ entity }) => {
            await new Promise(resolve => setTimeout(resolve, 100));
            const firestore = getFirestore();
            return getDoc(doc(collection(firestore, entity.path, entity.id, "locales"), "de-DE"))
                .then((snapshot: any) => snapshot.get("name") as string);
        }
    };

    return buildCollection({
        id: "diagnosis",
        path: "diagnosis",
        name: "Diagnosis",
        properties: {
            name: {
                name: "Name",
                dataType: "string",
                columnWidth: 360,
                validation: {
                    required: true
                }
            },
            icd_10_code: {
                name: "ICD-10 code",
                dataType: "string",
                validation: {
                    matches: /^[A-Z]\d{2}(\.\d+)?$/,
                    unique: true
                }
            },
            replaced_by: {
                name: "Replaced by",
                dataType: "reference",
                path: "diagnosis"
            },
            legacy_id: {
                name: "Legacy id",
                dataType: "string",
                disabled: true
            },
            enabled: {
                name: "Enabled",
                dataType: "boolean"
            },
            potential_pain_areas: {
                name: "Potential pain areas",
                dataType: "array",
                Field: BodyPartsField,
                customProps: {
                    mapped: false,
                    mirroring: true,
                    multiSelect: true
                },
                Preview: BodyPartsPreview,
                of: {
                    dataType: "string"
                }
            },
            comment: {
                name: "Comment",
                dataType: "string",
                longDescription: "to store thoughts or annotations that might come up during the knowledge acquisition process for a diagnosis"
            },
            created_at: buildProperty({
                dataType: "date",
                name: "Created At",
                autoValue: "on_create"
            })
        },
        singularName: "Diagnosis",
        defaultSize: "s",
        group: "Core",
        textSearchEnabled: true,
        exportable: {
            additionalFields: [sampleAdditionalExportColumn]
        },
        additionalFields: [diagnosisGermanTitleColumn],
        subcollections: [
            buildDiagnosisRestrictions(),
            buildDiagnosisMusclesCollection(),
            buildDiagnosisLocaleCollection()]
    });
}


export type DiagnosisLocale = {
    name: string;
    synonyms: string[];
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




