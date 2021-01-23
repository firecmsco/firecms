import { MouseEventHandler } from "react";
import { EntitySchema, Property } from "./models";

export type PreviewSize = "regular" | "small" | "tiny";

export interface PreviewComponentFactoryProps{
    PreviewComponent: React.ComponentType<PreviewComponentProps<any>>
}

export interface PreviewComponentProps<T = any> {
    name: string,
    value: T,
    property: Property<T>,
    onClick?: MouseEventHandler<any>,
    size: PreviewSize,
    entitySchema: EntitySchema;
}
