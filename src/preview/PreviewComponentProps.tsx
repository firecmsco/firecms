import { Property } from "../models";

export interface PreviewComponentProps<T> {
    value: T,
    property: Property<T>,
    small: boolean
}
