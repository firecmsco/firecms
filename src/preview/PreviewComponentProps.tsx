import { Property } from "../models";

export interface PreviewComponentProps<T> {
    name: string,
    value: T,
    property: Property<T>,
    small: boolean
}
