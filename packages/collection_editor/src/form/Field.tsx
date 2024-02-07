import * as React from "react";
import { useFormex } from "./Formex";
import { getIn, isObject } from "./utils";
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

export interface FieldProps<V = any, FormValues extends object = any> {
    field: FieldInputProps<V>;
    form: FormexController<FormValues>;
}

export interface FieldConfig<V = any> {
    /**
     * Field component to render. Can either be a string like 'select' or a component.
     */
    component?:
        | string
        | React.ComponentType<FieldProps<V>>
        | React.ComponentType
        | React.ForwardRefExoticComponent<any>;

    /**
     * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
     */
    as?:
        | React.ComponentType<FieldProps<V>["field"]>
        | string
        | React.ComponentType
        | React.ForwardRefExoticComponent<any>;

    /**
     * Children render function <Field name>{props => ...}</Field>)
     */
    children?: ((props: FieldProps<V>) => React.ReactNode) | React.ReactNode;

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

export type FieldAttributes<T> = {
    className?: string;
} & FieldConfig<T>
    & T
    & {
    name: string,
};

export function Field({
                          validate,
                          name,
                          children,
                          as: is, // `as` is reserved in typescript lol
                          component,
                          className,
                          ...props
                      }: FieldAttributes<any>) {
    const {
        values,
        handleChange,
        handleBlur,
        // validate: _validate,
        // validationSchema: _validationSchema,
        ...formik
    } = useFormex();

    const getFieldProps = React.useCallback(
        (nameOrOptions: string | FieldConfig<any>): FieldInputProps<any> => {
            const isAnObject = isObject(nameOrOptions);
            const name = isAnObject
                ? (nameOrOptions as FieldConfig<any>).name
                : nameOrOptions;
            const valueState = getIn(values, name);

            const field: FieldInputProps<any> = {
                name,
                value: valueState,
                onChange: handleChange,
                onBlur: handleBlur,
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
        },
        [handleBlur, handleChange, values]
    );

    const field = getFieldProps({ name, ...props });
    if (component) {
        if (typeof component === "string") {
            const { innerRef, ...rest } = props;
            return React.createElement(
                component,
                { ref: innerRef, ...field, ...rest, className },
                children
            );
        }
        return React.createElement(
            component,
            { field, form: formik, ...props, className },
            children
        );
    }

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
