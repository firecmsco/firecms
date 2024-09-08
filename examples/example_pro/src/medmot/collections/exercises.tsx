import { EnumValues } from "@firecms/core";

export type Exercise = {
    description: string,
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
    legacy_id: string,
    basic_exercise_data_finished: boolean,
    joint_movements_finished: boolean,
}

export const exerciseTypes: EnumValues = {
    release: "Release",
    mobility: "Mobility",
    control: "Strength"
};



/*const TitleColumn: ExportMappingFunction = {
    key: "title",
    Builder: ({
                  entity,
                  context
              }) => (entity as Entity<BidEntry>).values.priority1 ?
        context.dataSource.fetchEntity<PrizeEntry>({
            path: (entity as Entity<BidEntry>).values.priority1.path,
            entityId: (entity as Entity<BidEntry>).values.priority1.id,
            collection: challengeAuctionPrizesCollection
        }).then((result) => {
            console.log(result);

            return `${result!.values.name.es} - ${result!.values.description.es}`;
        }) : ""
};*/
