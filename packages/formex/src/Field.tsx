import * as React from "react";
import { useFormex } from "./Formex";
import { getIn, isFunction, isObject } from "./utils";
import { FormexController } from "./types";

export interface FieldInputProps<Value> {
    /** Value of the field */
    value: Value;
    /** Name of the field */
    name: string;
    /** Multiple select? */
    multiple?: boolean;
    /** Is the field checked? */
    checked?: boolean;
    /** Change event handler */
    onChange: (event: React.SyntheticEvent) => void,
    /** Blur event handler */
    onBlur: (event: React.FocusEvent) => void,
}

export interface FormexFieldProps<Value = any, FormValues extends object = any> {
    field: FieldInputProps<Value>;
    form: FormexController<FormValues>;
}

export type FieldValidator = (
    value: any
) => string | void | Promise<string | void>;

export interface FieldConfig<Value, C extends React.ElementType | undefined = undefined> {

    /**
     * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
     */
    as?:
        | C
        | string
        | React.ForwardRefExoticComponent<any>;

    /**
     * Children render function <Field name>{props => ...}</Field>)
     */
    children?: ((props: FormexFieldProps<Value>) => React.ReactNode) | React.ReactNode;

    /**
     * Validate a single field value independently
     */
    // validate?: FieldValidator;

    /**
     * Used for 'select' and related input types.
     */
    multiple?: boolean;

    /**
     * Field name
     */
    name: string;

    /** HTML input type */
    type?: string;

    /** Field value */
    value?: any;

    /** Inner ref */
    innerRef?: (instance: any) => void;

}

export type FieldProps<T, C extends React.ElementType | undefined> = {
    as?: C;
} & (C extends React.ElementType ? (React.ComponentProps<C> & FieldConfig<T, C>) : FieldConfig<T, C>);

export function Field<T, C extends React.ElementType | undefined = undefined>({
                                                                                  validate,
                                                                                  name,
                                                                                  children,
                                                                                  as: is, // `as` is reserved in typescript lol
                                                                                  // component,
                                                                                  className,
                                                                                  ...props
                                                                              }: FieldProps<T, C>) {
    const formex = useFormex();

    const field = getFieldProps({ name, ...props }, formex);

    if (isFunction(children)) {
        return children({ field, form: formex });
    }

    // if (component) {
    //     if (typeof component === "string") {
    //         const { innerRef, ...rest } = props;
    //         return React.createElement(
    //             component,
    //             { ref: innerRef, ...field, ...rest, className },
    //             children
    //         );
    //     }
    //     return React.createElement(
    //         component,
    //         { field, form: formex, ...props, className },
    //         children
    //     );
    // }

    // default to input here so we can check for both `as` and `children` above
    const asElement = is || "input";

    if (typeof asElement === "string") {
        const { innerRef, ...rest } = props;
        return React.createElement(
            asElement,
            { ref: innerRef, ...field, ...rest, className },
            children
        );
    }

    return React.createElement(asElement, { ...field, ...props, className }, children);
}

const getFieldProps = (nameOrOptions: string | FieldConfig<any>, formex: FormexController<any>): FieldInputProps<any> => {
    const isAnObject = isObject(nameOrOptions);
    const name = isAnObject
        ? (nameOrOptions as FieldConfig<any>).name
        : nameOrOptions;
    const valueState = getIn(formex.values, name);

    const field: FieldInputProps<any> = {
        name,
        value: valueState,
        onChange: formex.handleChange,
        onBlur: formex.handleBlur,
    };
    if (isAnObject) {
        const {
            type,
            value: valueProp, // value is special for checkboxes
            as: is,
            multiple,
        } = nameOrOptions as FieldConfig<any>;

        if (type === "checkbox") {
            if (valueProp === undefined) {
                field.checked = !!valueState;
            } else {
                field.checked = !!(
                    Array.isArray(valueState) && ~valueState.indexOf(valueProp)
                );
                field.value = valueProp;
            }
        } else if (type === "radio") {
            field.checked = valueState === valueProp;
            field.value = valueProp;
        } else if (is === "select" && multiple) {
            field.value = field.value || [];
            field.multiple = true;
        }
    }
    return field;
};
