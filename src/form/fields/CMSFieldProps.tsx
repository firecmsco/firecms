import { Property } from "../../models";
import { ReactElement } from "react";

export interface CMSFieldProps<Value, P extends Property> {
    name: string,
    property: P,
    value: Value,
    errors: any,
    touched: any,
    includeDescription: boolean,
    createFormField: (key: string, property: Property, value: any, includeDescription: boolean, error: any, touched: any) => ReactElement
}
