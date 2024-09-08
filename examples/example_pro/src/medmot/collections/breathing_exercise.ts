import { buildCollection, EnumValues, Permissions } from "@firecms/core";
import { locales } from "../locales";

export type BreathingExerciseAction = {
    action: "inhale" | "hold" | "exhale";
    duration_seconds: number
}
export type BreathingExercise = {
    exercise_key: string,
    entries: BreathingExerciseAction[],
    duration_options_seconds: number[],
    enabled: boolean,
    order: number,
    image: string,
}

export type BreathingExerciseLocale = {
    exercise_title: string,
    exercise_subtitle: string,
    description: string,
}

const breathingExerciseActionTypes: EnumValues = {
    inhale: "Inhale",
    hold: "Hold",
    exhale: "Exhale"
};

/*const priority1NameColumn: ExportMappingFunction = {
    key: "priority1_fullname",
    Builder: ({
                  entity,
                  context
              }) => (entity as Entity<BreathingExercise>).values.exercise_key ?
        context.dataSource.fetchEntity<BreathingExerciseLocale>({
            path: (entity as Entity<BreathingExercise>).id,
            entityId: (entity as Entity<BidEntry>).values.priority1.id,
            collection: challengeAuctionPrizesCollection
        }).then((result) => {
            console.log(result);

            return `${result!.values.name.es} - ${result!.values.description.es}`;
        }) : ""
};*/


export function buildBreathingExercisesCollection() {

    const breathingExerciseLocaleCollection = buildCollection<BreathingExerciseLocale>({
        properties: {
            exercise_title: {
                name: "Title",
                validation: { required: true },
                dataType: "string",
                columnWidth: 180
            },
            exercise_subtitle: {
                name: "Subtitle",
                validation: { required: true },
                dataType: "string",
                columnWidth: 180
            },
            description: {
                name: "Description",
                validation: { required: false },
                markdown: true,
                multiline: true,
                dataType: "string"
            }
        },
        customId: locales,
        name: "Breathing Exercise translations",
        singularName: "Translation",
        id: "locales",
        path: "locales",
    })

    return buildCollection<BreathingExercise>({
        name: "Breathing Exercises",
        singularName: "Breathing Exercise",
        group: `Core`,
        id: `breathing_exercises`,
        path: `breathing_exercises`,
        subcollections: [
            breathingExerciseLocaleCollection
        ],
        properties: {
            exercise_key: {
                name: "Exercise Key",
                validation: { required: true },
                dataType: "string",
                columnWidth: 180
            },
            entries: {
                name: "Breathing Action",
                dataType: "array",
                of: {
                    dataType: "map",
                    properties: {
                        action: {
                            name: "Breathing Exercise action",
                            longDescription:
                                "This contains all the actions a breathing exercise has.",
                            dataType: "string",
                            enumValues: breathingExerciseActionTypes
                        },
                        duration_seconds: {
                            name: "Duration seconds",
                            dataType: "number"
                        }
                    }
                },
                columnWidth: 400
            },
            duration_options_seconds: {
                name: "Duration options",
                dataType: "array",
                of: {
                    dataType: "number"
                }
            },
            order: {
                name: "Order",
                dataType: "number",
            },
            image: {
                name: "Image",
                dataType: "string",
                description: "Image used in the App.",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            enabled: {
                name: "Enabled",
                dataType: "boolean",
                description: "Enable button for breathing exercise",
            },
        }
    });
}


