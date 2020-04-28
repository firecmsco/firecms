import { Properties, Property } from "../models";

export function getCollectionTableProperties(properties: Properties): [string, Property][] {
    return Object.entries(properties).filter(([_, property]) => property.includeInListView);
}


export function getFilterableProperties(properties: Properties): [string, Property][] {
    return Object.entries(properties).filter(([_, property]) => property.filterable);
}
