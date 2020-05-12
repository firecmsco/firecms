import { Property } from "../models";
import React from "react";


export interface PreviewComponentProps<T> {
    value: T,
    property: Property<T>,
    small: boolean
}
