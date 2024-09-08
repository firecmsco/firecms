import { buildCollection, buildProperty, EnumValues } from "@firecms/core";
import { bodyPartsEnum } from "./fields/body/body_parts";
import BodyPartsField from "./fields/body/BodyPartsField";
import BodyPartsPreview from "./fields/body/BodyPartsPreview";
import BodyPartsPrioritiesField from "./fields/body/BodyPartsPrioritiesField";
import BodyPartsPrioritiesPreview from "./fields/body/BodyPartsPrioritiesPreview";
import { bodyPartsMap } from "./fields/body/body_parts";
import { locales } from "./locales";

const exerciseTypes: EnumValues = {
    release: "Release",
    mobility: "Mobility",
    control: "Strength"
};

const searchStrategies: EnumValues = {
    target_area: "Target Area",
    cause: "Cause"
};

const goalTypes: EnumValues = {
    pain_relief: "Pain relief",
    prevention: "Prevention"
};

const diagnosisTypes: EnumValues = {
    ankylosing_spondylitis: "Ankylosing spondylitis",
    bws_syndrome: "Bws syndrome",
    fibromyalgia: "Fibromyalgia",
    hypermobility: "Hypermobility",
    rheumatism: "Rheumatism",
    slipped_vertebra: "Slipped vertebra"
};

export const StartingPositionCategories: EnumValues = {
    standing: "standing",
    chair: "chair",
    floor: "floor"
};

const workTypes = {
    standing: "Standing work",
    sitting: "Sitting work",
    sitting_standing: "Sitting and standing work",
    hard_work: "Hard physical work"
};

export const sportEffectCollection = buildCollection<any>({
    id: "medico_v1_2_0_sport_effects",
    path: "medico/v1.2.0/sport_effects",
    group: "Medico v1.2.0",
    name: "Sport effects",
    singularName: "Sport effect",
    customId: true,
    properties: {
        sport: {
            name: "Sport",
            dataType: "reference",
            path: "sports",
            validation: {
                required: true,
                unique: true
            }
        },
        stressed_body_parts: {
            name: "Stressed body parts",
            validation: { required: true },
            dataType: "map",
            columnWidth: 300,
            Field: BodyPartsPrioritiesField,
            Preview: BodyPartsPrioritiesPreview
        }
    }
});

export const workTypeEffectCollection = buildCollection<any>({
    id: "medico_v1_2_0_work_type_effects",
    path: "medico/v1.2.0/work_type_effects",
    group: "Medico v1.2.0",
    name: "Work type effects",
    singularName: "Work type effect",
    customId: true,
    properties: {
        work_type: {
            name: "Work type",
            dataType: "reference",
            path: "work_types",
            validation: {
                required: true,
                unique: true
            }
        },
        stressed_body_parts: {
            name: "Stressed body parts",
            validation: { required: true },
            dataType: "map",
            columnWidth: 300,
            Field: BodyPartsPrioritiesField,
            Preview: BodyPartsPrioritiesPreview
        }
    }
});

export const diagnosisExercisePlanCollection = buildCollection<any>({
    id: "medico_v1_1_0_diagnosis_exercise_plans",
    path: "medico/v1.1.0/diagnosis_exercise_plans",
    group: "Medico v1.1.0",
    name: "Diagnosis exercises plans",
    singularName: "Diagnosis Exercise Plan",
    properties: {
        goal: {
            name: "Goal",
            dataType: "string",
            enumValues: goalTypes
        },
        diagnosis: {
            name: "Diagnosis",
            dataType: "string",
            enumValues: diagnosisTypes
        },
        start_day: {
            name: "Start day",
            dataType: "number"
        },
        end_day: {
            name: "End day",
            customProps: {
                allowInfinity: true
            },
            dataType: "number"
        },
        exercises: {
            name: "Exercises",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    exercise_type: {
                        name: "Exercise type",
                        longDescription:
                            "Exercises can have different effects on the body and thus pursue different goals. In the exercises is currently between 3 different modes of action Release, Mobility and Control. Each of these 3 modes of action has a different goal, so exercises with different modes of action should not be compared with each other. An exercise has different effects on different parts of the body simultaneously.",
                        dataType: "string",
                        enumValues: exerciseTypes
                    },
                    search_adjacent: {
                        name: "Search adjacent",
                        dataType: "boolean"
                    },
                    search_strategy: {
                        name: "Search strategy",
                        dataType: "string",
                        enumValues: searchStrategies
                    },
                    slot: {
                        name: "Slot",
                        dataType: "number"
                    }
                }
            },
            columnWidth: 400
        }
    }
});

export const causePriorityCollection = buildCollection<any>({
    id: "medico_v1_1_0_cause_priorities",
    name: "Cause Priorities",
    singularName: "Cause Priority",
    path: "medico/v1.1.0/cause_priorities",
    group: "Medico v1.1.0",
    defaultSize: "l",
    properties: {
        exercise_type: {
            name: "Exercise type",
            validation: { required: true },
            longDescription:
                "Exercises can have different effects on the body and thus pursue different goals. In the exercises is currently between 3 different modes of action Release, Mobility and Control. Each of these 3 modes of action has a different goal, so exercises with different modes of action should not be compared with each other. An exercise has different effects on different parts of the body simultaneously.",
            dataType: "string",
            enumValues: exerciseTypes
        },
        work: {
            name: "Work",
            validation: { required: true },
            dataType: "string",
            enumValues: workTypes
        },
        pain_area: {
            name: "Pain area",
            validation: { required: true },
            dataType: "string",
            enumValues: bodyPartsEnum,
            columnWidth: 300,
            Field: BodyPartsField,
            customProps: {
                mapped: false,
                multiSelect: false
            },
            Preview: BodyPartsPreview
        },
        cause_priorities: {
            name: "Cause priorities",
            validation: { required: true },
            dataType: "map",
            columnWidth: 300,
            Field: BodyPartsPrioritiesField,
            Preview: BodyPartsPrioritiesPreview,
            properties: {
                ...Object.keys(bodyPartsMap).map((part) => ({
                    [part]: {
                        dataType: "string"
                    } as any
                })).reduce((a, b) => ({ ...a, ...b }), {})
            }
        },
        updated_on: {
            name: "Updated on",
            dataType: "date",
            autoValue: "on_update"
        }
    }
});

export const diagnosisExercisePlanCollection2 = buildCollection<any>({
    id: "medico_v1_2_0_diagnosis_exercise_plans",
    path: "medico/v1.2.0/diagnosis_exercise_plans",
    group: "Medico v1.2.0",
    name: "Diagnosis exercises plans",
    singularName: "Diagnosis Exercise Plan",
    properties: {
        goal: {
            name: "Goal",
            dataType: "string",
            enumValues: goalTypes
        },
        diagnosis: {
            name: "Diagnosis",
            dataType: "string",
            disabled: true
        },
        diagnosis_ref: {
            name: "Diagnosis reference",
            dataType: "reference",
            path: "diagnosis"
        },
        start_day: {
            name: "Start day",
            dataType: "number"
        },
        end_day: {
            name: "End day",
            customProps: {
                allowInfinity: true
            },
            dataType: "number"
        },
        exercises: {
            name: "Exercises",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    exercise_type: {
                        name: "Exercise type",
                        longDescription:
                            "Exercises can have different effects on the body and thus pursue different goals. In the exercises is currently between 3 different modes of action Release, Mobility and Control. Each of these 3 modes of action has a different goal, so exercises with different modes of action should not be compared with each other. An exercise has different effects on different parts of the body simultaneously.",
                        dataType: "string",
                        enumValues: exerciseTypes
                    },
                    search_adjacent: {
                        name: "Search adjacent",
                        dataType: "boolean"
                    },
                    search_strategy: {
                        name: "Search strategy",
                        dataType: "string",
                        enumValues: searchStrategies
                    },
                    slot: {
                        name: "Slot",
                        dataType: "number"
                    }
                }
            },
            columnWidth: 400
        }
    }
});

export const causePriorityCollection2 = buildCollection<any>({
    id: "medico_v1_2_0_cause_priorities",
    path: "medico/v1.2.0/cause_priorities",
    group: "Medico v1.2.0",
    name: "Cause priorities",
    defaultSize: "l",
    singularName: "Cause Priority",
    properties: {
        exercise_type: {
            name: "Exercise type",
            validation: { required: true },
            longDescription:
                "Exercises can have different effects on the body and thus pursue different goals. In the exercises is currently between 3 different modes of action Release, Mobility and Control. Each of these 3 modes of action has a different goal, so exercises with different modes of action should not be compared with each other. An exercise has different effects on different parts of the body simultaneously.",
            dataType: "string",
            enumValues: exerciseTypes
        },
        work_mode: {
            name: "Work mode",
            validation: { required: true },
            dataType: "string",
            enumValues: workTypes
        },
        pain_area: {
            name: "Pain area",
            validation: { required: true },
            dataType: "string",
            columnWidth: 300,
            Field: BodyPartsField,
            customProps: {
                mapped: false,
                multiSelect: false
            },
            Preview: BodyPartsPreview,
            enumValues: bodyPartsEnum
        },
        cause_priorities: {
            name: "Cause priorities",
            validation: { required: true },
            dataType: "map",
            columnWidth: 300,
            Field: BodyPartsPrioritiesField,
            Preview: BodyPartsPrioritiesPreview,
            properties: {
                ...Object.keys(bodyPartsMap).map((part) => ({
                    [part]: {
                        dataType: "string"
                    } as any
                })).reduce((a, b) => ({ ...a, ...b }), {})
            }
        },
        updated_on: {
            name: "Updated on",
            dataType: "date",
            autoValue: "on_update"
        }
    }
});

export const jointLocaleCollection = buildCollection<any>({
    id: "medico_v2_0_0_joint_locales",
    name: "Translations",
    path: "locales",
    properties: {
        medical_name: {
            name: "Medical name",
            validation: { required: true },
            dataType: "string"
        },
        common_name: {
            name: "Common name",
            dataType: "string"
        }
    },
    customId: locales,
    singularName: "Translation"
});

export const jointMovementsCollection = buildCollection<any>({
    id: "medico_v2_0_0_joint_movements",
    name: "Joint movements",
    singularName: "Joint movements",
    path: "movements",
    subcollections: [
        jointLocaleCollection
    ],
    customId: {
        abduction: "Abduction",
        adduction: "Adduction",
        anteversion: "Anteversion",
        retroversion: "Retroversion",
        anteversion_with_90_abducted_arm: "Anteversion with 90° abducted arm",
        retroversion_with_90_abducted_arm: "Retroversion with 90° abducted arm",
        external_rotation: "External rotation",
        internal_rotation: "Internal rotation",
        external_rotation_with_90_abducted_arm: "External rotation with 90° abducted arm",
        internal_rotation_with_90_abducted_arm: "Internal rotation with 90° abducted arm",
        extension: "Extension",
        flexion: "Flexion",
        opposition: "Opposition",
        reposition: "Reposition",
        supination: "Supination",
        pronation: "Pronation",
        palmar_flexion: "Palmar flexion",
        dorsiflexion: "Dorsiflexion",
        ulnar_abduction: "Ulnar abduction",
        radial_abduction: "Radial abduction",
        movement: "Movement",
        abduction_with_90_flexed_hip_joint: "Abduction with 90° flexed hip joint",
        adduction_with_90_flexed_hip_joint: "Adduction with 90° flexed hip joint",
        external_rotation_with_90_flexed_hip_joint: "External rotation with 90° flexed hip joint",
        internal_rotation_with_90_flexed_hip_joint: "Internal rotation with 90° flexed hip joint",
        eversion: "Eversion",
        inversion: "Inversion",
        lateral_flexion_right: "Lateral flexion right",
        lateral_flexion_left: "Lateral flexion left",
        rotation_right: "Rotation right",
        rotation_left: "Rotation left",
        ventral_flexion: "Ventral flexion",
        ventral_flexion_finger_floor_distance: "Ventral flexion (finger floor distance)",
        dorsal_extension: "Dorsal extension",
        depression: "Depression",
        protrusion: "Protrusion",
        lateral_deviation_right: "Lateral deviation right",
        lateral_deviation_left: "Lateral deviation left",
        elevation: "Elevation",
        protraction: "Protraction",
        retraction: "Retraction",
        horizontal_abduction: "Horizontal abduction",
        horizontal_adduction: "Horizontal adduction",
        circumduction: "Circumduction",
        compression: "Compression",
        plantar_flexion: "Plantar flexion",
    },
    properties: {
        reference_value_min: {
            name: "Reference value min",
            dataType: "number"
        },
        reference_value_max: {
            name: "Reference value min",
            dataType: "number"
        },
        image: {
            name: "Image",
            dataType: "string",
            description: "Image of the joint",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        }
    },
});

export const jointsCollection = buildCollection<any>({
    id: "medico_v2_0_0_joints",
    name: "Joint",
    customId: true,
    path: "medico/v2.0.0/joints",
    group: "Medico v2.0.0",
    textSearchEnabled: true,
    singularName: "Joints",
    // initialFilter: {
    //     medico_leaf: ["==", true]
    // },
    subcollections: [
        jointMovementsCollection,
        jointLocaleCollection
    ],
    properties: {
        latin_name: {
            name: "Latin name",
            dataType: "string",
            validation: { required: true }
        },
        english_name: {
            name: "English name",
            dataType: "string",
            validation: { required: true }
        },
        related_body_parts: {
            name: "Related body parts",
            dataType: "array",
            Field: BodyPartsField,
            customProps: {
                mapped: false,
                multiSelect: true
            },
            Preview: BodyPartsPreview,
            description: "The body parts this podcasts refers to",
            of: {
                dataType: "string",
                enumValues: bodyPartsEnum
            }
        },
        parent_joint: {
            name: "Parent joint",
            dataType: "reference",
            description: "Parent node in tree",
            path: "medico/v2.0.0/joints"
        },
        mirror_joint: {
            name: "Mirror joint",
            dataType: "reference",
            description: "Mirror node in tree",
            path: "medico/v2.0.0/joints"
        },
        image: {
            name: "Image",
            dataType: "string",
            description: "Image of the joint",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        },
        medico_leaf: {
            name: "Medico leaf",
            dataType: "boolean",
            description: "True if this joint is on the lowest level from medico side"
        },
        medico_enabled: {
            name: "Medico enabled",
            dataType: "boolean",
            description: "True if we consider this joint in medico"
        },
        medical_leaf: {
            name: "Medical leaf",
            dataType: "boolean",
            description: "True if this joint is on the lowest level from a medical point of view"
        },
        located: {
            name: "Located",
            dataType: "string",
            enumValues: {
                "left": "Left",
                "right": "Right",
                "middle": "Middle"
            }
        }
    }
});

export const startingPositionLocaleCollection = buildCollection<any>({
    id: "medico_v2_0_0_starting_position_locales",
    name: "Translations",
    path: "locales",
    singularName: "Translation",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        description: {
            name: "Description",
            dataType: "string"
        },
    },
    customId: locales
});


export const startingPositionSchema = buildCollection<any>({
    id: "medico_v2_0_0_starting_positions",
    customId: true,
    path: "starting_positions",
    group: "Core",
    textSearchEnabled: true,
    name: "Starting Positions",
    subcollections: [
        startingPositionLocaleCollection
    ],
    singularName: "Starting position",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        image: {
            name: "Image",
            dataType: "string",
            description: "example image of the starting position",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        },
        starting_position_category: {
            name: "Starting position category",
            validation: { required: true },
            dataType: "string",
            enumValues: StartingPositionCategories,
            longDescription: "rough category where the position takes place. used for the reordering of exercises to reduce changes of position"
        },
        loaded_body_parts: {
            name: "Loaded body parts",
            dataType: "array",
            defaultValue: [],
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
    }
});

export function buildMedicoCollections() {

    return [
        { ...causePriorityCollection },
        { ...causePriorityCollection2 },
        { ...diagnosisExercisePlanCollection },
        { ...diagnosisExercisePlanCollection2 },
        { ...workTypeEffectCollection },
        { ...sportEffectCollection },
        {
            ...jointsCollection,
            subcollections: [
                {
                    ...jointMovementsCollection,
                    subcollections: [
                        { ...jointLocaleCollection }
                    ],
                },
                { ...jointLocaleCollection }
            ],
        },
        { ...startingPositionSchema }
    ];
}

