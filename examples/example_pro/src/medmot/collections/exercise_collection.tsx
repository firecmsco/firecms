import {
    AdditionalFieldDelegate,
    buildCollection,
    buildProperty,
    Entity,
    EnumValues,
    FireCMSContext,
    NumberPropertyValidationSchema,
    Permissions,
    PropertiesOrBuilders
} from "@firecms/core";
import BodyPartsField from "./fields/body/BodyPartsField";
import BodyPartsPreview from "./fields/body/BodyPartsPreview";
import { locales } from "./locales";
import ExerciseTitle from "./fields/ExerciseTitlePreview";
import React from "react";
import { CopyMovementsAction } from "./actions/CopyMovementsAction";
import { slugify } from "./slugify";
import ExerciseRelatedPreview from "./fields/ExerciseRelatedPreview";
import ExerciseRelatedField from "./fields/ExerciseRelatedField";
import { bodyPartsEnum, bodyPartsMappedEnum } from "./fields/body/body_parts";
import { ArchiveExerciseAction } from "./actions/ArchiveExerciseAction";

export type Exercise = {
    description: string, // obsolete, replaced by therapeutical_description, is "description" needed in the app or can it be deleted?
    therapeutical_description: string,
    body_parts: string[],
    main_effect_body_parts: string[],
    side_effect_body_parts: Record<string, string[]>,
    daytime: {
        morning: number,
        midday: number,
        evening: number
    },
    physical_intensity: number,
    risk_factor: number,
    muscular_load: number,
    movement_complexity: number,
    exercise_type: string,
    exercise_subtype?: string,
    starting_position?: string,
    loaded_body_parts?: string[],
    tools: string[],
    medico_enabled: boolean,
    available_locales: string[],
    tags: string[],
    fallback_tags: string[],
    image: string,
    prevention_20_valid: boolean,
    created_at: Date,
    last_update: Date,
    legacy_id: string,
    basic_exercise_data_finished: boolean,
    joint_movements_finished: boolean,
    to_be_released: boolean
}

export type ExerciseLocale = {
    exercise_title: string,
    summary: string,
    exercise_goal: string,
    video: string,
    selectable: boolean,
    description: string,
    generic_aim_description: string,
    question: string,
    video_preview: string,
    video_instructions: string,
    video_id: number,
    video_duration_seconds: number,
    sync_status: string
    subtitle: string,
    transcript_available: boolean,
    video_available: boolean,
    audio_available: boolean,

    // subtitle_file: string
    // subtitle_raw: string,
    // subtitle_raw_file: string
}

export const exerciseTypes: EnumValues = {
    release: { id: "release", label: "Release", color: "greenLight" },
    mobility: { id: "mobility", label: "Mobility", color: "orangeDark" },
    control: { id: "control", label: "Strength", color: "redDark" }
};

export const exerciseSubtypes: EnumValues = {
    // release subtypes
    massage: { id: "massage", label: "Massage", color: "greenLight" },
    stretching: { id: "stretching", label: "Stretching", color: "greenLight" }, // will be obsolete after knowledge revision (static and dynamic stretching as new types)
    static_stretching: { id: "static_stretching", label: "Static stretching", color: "greenLight" },
    dynamic_stretching: { id: "dynamic_stretching", label: "Dynamic stretching", color: "greenLight" },
    breathing: { id: "breathing", label: "Breathing", color: "greenLight" },
    // mobility subtypes
    holding: { id: "holding", label: "Holding", color: "orangeDark" },
    small_moving: { id: "small_moving", label: "Small moving", color: "orangeDark" },
    end_of_range_movement: { id: "end_of_range_movement", label: "End of range movement", color: "orangeDark" },
    increasing_range_of_motion: {
        id: "increasing_range_of_motion",
        label: "Increasing range of motion",
        color: "orangeDark"
    },
    // strength subtypes
    isometric: { id: "isometric", label: "Isometric", color: "redDark" },
    eccentric: { id: "eccentric", label: "Eccentric", color: "redDark" },
    concentric: { id: "concentric", label: "Concentric", color: "redDark" },
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


const tools: EnumValues = {
    ball: "Ball",
    small_roll: "Small roll",
    hand: "Hand",
    towel: "Towel",
    weigh: "Weight",
    chair: "Chair",
    small_object: "Small object",
    book: "Book",
    yoga_block: "Yoga block",
    duo_ball: "Duo ball",
    high_back_chair: "High back chair",
    table: "Table",
    fascia_roll: "Fascia roll",
    wall: "Wall",
    filled_water_bottle: "Filled water bottle",
    hanky: "Hanky"
};


const dayTimeValidation: NumberPropertyValidationSchema = {
    min: 0,
    max: 3,
    integer: true
};


const exerciseTitleColumn: AdditionalFieldDelegate = {
    key: "title",
    name: "Title",
    width: 300,
    Builder: ({ entity }) => (
        <ExerciseTitle entity={entity}/>
    )
};

interface SimilarExercise {
    exercise?: string;
    similarity_degree: number;
}

const similarExercisesCollection = buildCollection<SimilarExercise>({
    name: "Similar exercises user perception",
    singularName: "Similar exercise",
    id: "similar_exercises_user_perception",
    path: "similar_exercises_user_perception",
    defaultSize: "l",
    properties: {
        exercise: {
            name: "Exercise",
            dataType: "reference",
            validation: { required: true },
            longDescription: "Exercises that appear to be similar from user perspective. This means that it feels for the user like he is doing nearly the same exercise especially because the movement is similar.",
            path: "exercises",
            Preview: ExerciseRelatedPreview,
            Field: ExerciseRelatedField,
        },
        similarity_degree: {
            name: "Degree of similarity",
            dataType: "number",
            longDescription: "some explanatory text how to set the degree",
            validation: {
                min: 0,
                max: 10,
                integer: true
            }
        }
    }
})

export const exerciseLocaleCollection = buildCollection<ExerciseLocale>({
    name: "Translations",
    singularName: "Exercise translation",
    id: "locales",
    path: "locales",
    defaultSize: "l",
    properties: {
        exercise_title: {
            name: "Title",
            validation: { required: true },
            dataType: "string",
            columnWidth: 180
        },
        summary: {
            name: "Summary",
            dataType: "string",
            multiline: true,
            description: "Summary of what is done in the exercise (same language as the rest of the exercise)"
        },
        exercise_goal: {
            name: "Exercise goal",
            dataType: "string",
            multiline: true,
            description: "Summary of what this exercise is for (same language as the rest of the exercise)"
        },
        video: {
            name: "Video",
            dataType: "string",
            validation: { required: false },
            storage: {
                storagePath: "videos",
                acceptedFiles: ["video/*"],
                fileName: ({ file }) => slugify(file.name)
            },
            description: "The translated video for the exercise",
            columnWidth: 360
        },
        selectable: {
            name: "Selectable",
            description: "Should this exercise translation be used in medico",
            dataType: "boolean"
        },
        description: {
            name: "Description",
            validation: { required: false },
            dataType: "string"
        },
        generic_aim_description: {
            name: "Generic aim description",
            description: "will be shown in app",

            longDescription: "A generic aim description of the exercise. This will be shown in the app if the user wants further information about a recommended exercise",
            validation: { required: false },
            dataType: "string"
        },
        question: {
            name: "Feedback question",
            validation: { required: false },
            dataType: "string"
        },
        video_preview: {
            name: "Video Preview",
            dataType: "string",
            validation: { required: false },
            storage: {
                storagePath: "video-previews",
                acceptedFiles: ["video/*"]
            },
            description: "The translated video for the exercise",
            columnWidth: 360
        },
        video_instructions: {
            name: "Video instructions",
            description: "Video instructions for internal use only",
            dataType: "string",
            multiline: true
        },
        video_id: {
            name: "Vimeo Video ID",
            description: "This field is set automatically when you upload a video",
            disabled: true,
            dataType: "number"
        },
        video_duration_seconds: {
            name: "Duration (seconds)",
            dataType: "number",
            disabled: true
        },
        sync_status: {
            name: "Vimeo sync status",
            enumValues: {
                in_progress: "In progress",
                synced: "Synced",
                error: "Error"
            },
            description: "This field is set automatically when you upload a video",
            disabled: true,
            dataType: "string"
        },
        subtitle: {
            name: "Subtitle",
            dataType: "string",
            validation: { required: false },
            multiline: true
        },
        transcript_available: {
            name: "Transcript available",
            dataType: "boolean"
        },
        video_available: {
            name: "Video available",
            dataType: "boolean"
        },
        audio_available: {
            name: "Audio available",
            dataType: "boolean"
        }
    },
    customId: locales,
});

export const exerciseJointMovementCollection = buildCollection<any>({
    name: "Joint movement",
    id: "joint_movements",
    path: "joint_movements",
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
    }],
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
                            path: values.joint?.path ? values.joint.path + "/" + values.joint.id + "/movements" : undefined,
                            validation: { required: true }
                        },
                        maximal_performed_extent: {
                            name: "Maximal performed extent",
                            dataType: "number"
                        },
                        enforced: {
                            name: "Enforced",
                            dataType: "boolean"
                        },
                        optional: {
                            dataType: "boolean",
                            name: "Optional movement",
                            longDescription: "a movement that is performed in the video but can be replaced by another position of the joint/movement"
                        },
                        aim_movement: {
                            dataType: "boolean",
                            name: "Aim movement",
                            longDescription: "a movement that is necessary for the aim of the exercise"
                        },
                        aim_relevant_holding_position: {
                            dataType: "boolean",
                            name: "Aim relevant holding position",
                            longDescription: "a position of a joint that deviates from the neutral position and is held in order to achieve the goal of the exercise."
                        },
                        static_position: {
                            dataType: "boolean",
                            name: "Static position",
                            longDescription: "a position of a joint deviating from neutral position but that is not changed during the exercise performance (e.g. flexed knee joints because of sitting on a chair)"
                        }
                    }
                }
            })
    }
});

const archiveExerciseColumn: AdditionalFieldDelegate = {
    key: "archive_exercise",
    name: "Archive exercise",
    Builder: ({ entity, context }: {
        entity: Entity<any>;
        context: FireCMSContext;
    }) => {
        return <ArchiveExerciseAction entity={entity}
                                      context={context}/>;
    }
};

export const exercisesCollection = buildCollection<Exercise>({
    id: "exercises",
    path: "exercises",
    defaultSize: "l",
    name: "Exercises",
    singularName: "Exercise",
    group: "Core",
    textSearchEnabled: true,
    additionalFields: [exerciseTitleColumn, archiveExerciseColumn],
    propertiesOrder: [
        "medico_enabled",

// @ts-ignore
        "title",
        "image",
        "main_effect_body_parts",
        "exercise_type",
        "exercise_subtype",
        "tags",
        "physical_intensity",
        "muscular_load",
        "movement_complexity",
        "risk_factor",
        "loaded_body_parts",
        "tools",
        "starting_position",
        "available_locales",
        "created_at",
        "to_be_released",
        "basic_exercise_data_finished",
        "joint_movements_finished",
        "prevention_20_valid",

// @ts-ignore
        "archive_exercise"
    ],
    properties: {
        image: {
            name: "Image",
            dataType: "string",
            description: "Image used in the App.",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        },
        exercise_type: {
            name: "Exercise type",
            validation: { required: true },
            dataType: "string",
            longDescription:
                "Exercises can have different effects on the body and thus pursue different goals. In the exercises is currently between 3 different modes of action Release, Mobility and Control. Each of these 3 modes of action has a different goal, so exercises with different modes of action should not be compared with each other. An exercise has different effects on different parts of the body simultaneously.",
            enumValues: exerciseTypes
        },
        exercise_subtype: {
            name: "Exercise subtype",
            dataType: "string",
            enumValues: exerciseSubtypes
        },
        main_effect_body_parts: {
            name: "Main effect body parts",
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
        side_effect_body_parts: {
            name: "Side effect body parts",
            dataType: "map",
            properties: Object.entries(exerciseTypes).map(([exerciseType, title]) => ({
                [exerciseType]: ({
                        dataType: "array",
                        //@ts-ignore
                        name: title.label,
                        of: {
                            dataType: "string",
                            enumValues: bodyPartsEnum
                        },
                        Field: BodyPartsField,
                        customProps: {
                            mapped: false,
                            mirroring: true,
                            multiSelect: true
                        },
                        Preview: BodyPartsPreview
                    }
                )
            })).reduce((a, b) => ({ ...a, ...b })) as PropertiesOrBuilders<any>
        },
        loaded_body_parts: {
            name: "Loaded body parts",
            dataType: "array",
            Field: BodyPartsField,
            customProps: {
                mapped: false,
                mirroring: true,
                multiSelect: true
            },
            Preview: BodyPartsPreview,
            of: {
                dataType: "string",
                enumValues: bodyPartsEnum
            }
        },
        physical_intensity: {
            name: "Physical intensity",
            longDescription:
                "Exercises can differ in their difficulty. This means that the training intensity of an exercise increases. For example, instead of a normal push-up you can do one-handed push-ups or push-ups with elevated leg level, which increases the resistance considerably. In this way, the training intensity can be dynamically regulated to train not only in the strength endurance range but also in the maximum strength range.",
            dataType: "number",
            validation: {
                min: 0,
                max: 10,
                integer: true
            }
        },
        risk_factor: {
            name: "Risk factor",
            dataType: "number",
            validation: {
                min: 0,
                max: 10,
                integer: true
            }
        },

        muscular_load: {
            name: "Muscular load",
            dataType: "number",
            description: "From 0 to 10",
            validation: {
                min: 0,
                max: 10,
                integer: true
            }
        },
        movement_complexity: {
            name: "Movement complexity",
            dataType: "number",
            description: "From 0 to 10",
            validation: {
                min: 0,
                max: 10,
                integer: true
            }
        },
        tools: {
            name: "Tools",
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: tools
            }
        },
        starting_position: {
            name: "Starting position",
            dataType: "reference",
            path: "starting_positions"
        },
        medico_enabled: ({ values }) => ({
            name: "Medico enabled",
            dataType: "boolean",
            description: "Should this exercise be selectable by medico",
            disabled: !values.available_locales || values.available_locales.length === 0 ?
                {
                    disabledMessage: "You need to have at least one valid translation to enable this exercise in Medico"
                }
                : false
        }),
        tags: {
            name: "Tags",
            description: "Used to set additional information to exercises. e.g. to be able to assign similar exercises",
            dataType: "array",
            of: {
                dataType: "string",
                previewAsTag: true
            }
        },
        available_locales: {
            name: "Available translations",
            description: "This field is set automatically when you upload a video and mark 'Selectable' in the translation",
            dataType: "array",
            readOnly: true,
            of: {
                dataType: "string",
                previewAsTag: true
            }
        },
        prevention_20_valid: {
            name: "Prevention 20 valid",
            dataType: "boolean",
            description: "Is the exercise valid for the Prevention 20 program"
        },
        description: { // obsolete, replaced by therapeutical_description, is "description" needed in the app or can it be deleted?
            name: "Description",
            dataType: "string"
        },
        therapeutical_description: {
            name: "Therapeutical description",
            dataType: "string"
        },
        fallback_tags: {
            name: "Fallback tags",
            description: "Determine if this exercise can be used as a fallback for medico in certain cases",
            dataType: "array",
            of: {
                dataType: "string",
                enumValues: {
                    pain_relief: "Pain relief",
                    prevention: "Prevention",
                    "M35.7": "Hypermobility",
                    "M45": "Bechterew’s disease"
                }
            }
        },
        basic_exercise_data_finished: {
            name: "Basic exercise data finished",
            dataType: "boolean"
        },
        joint_movements_finished: {
            name: "Joint movements finished",
            dataType: "boolean"
        },
        to_be_released: {
            name: "To be released",
            dataType: "boolean"
        },
        daytime: {
            name: "Daytime",
            dataType: "map",
            longDescription:
                "Exercises or exercise types can differ in whether they have a special effect at a certain time of day. For example, the body may react better to certain types of exercise in the morning than in the evening. Priorities for times of day are introduced for this purpose.",
            properties: {
                morning: {
                    name: "Morning",
                    dataType: "number",
                    validation: dayTimeValidation
                },
                midday: {
                    name: "Midday",
                    dataType: "number"
                },
                evening: {
                    name: "Evening",
                    dataType: "number"
                }
            }
        },
        created_at: buildProperty({
            dataType: "date",
            name: "Created At",
            autoValue: "on_create"
        }),
        last_update: {
            dataType: "date",
            name: "Last update",
            autoValue: "on_update"
        },
        legacy_id: {
            name: "Legacy id",
            dataType: "string"
        },
        body_parts: {
            name: "Legacy body parts",
            dataType: "array",
            Field: BodyPartsField,
            customProps: {
                mapped: true,
                multiSelect: true
            },
            Preview: BodyPartsPreview,
            description:
                "An exercise has one main effect (exercise type) on different parts of the body simultaneously.",
            of: {
                dataType: "string",
                enumValues: bodyPartsMappedEnum
            }
        },
    }
});

export function buildExercisesCollection() {
    return {
        ...exercisesCollection,
        subcollections: [
            {
                ...exerciseLocaleCollection,
            },
            exerciseJointMovementCollection,
            similarExercisesCollection
        ],
    }
}


const numberOfAnswersValidation: NumberPropertyValidationSchema = {
    min: 0,
    max: 10,
    integer: true
};
