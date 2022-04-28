import { Field, getIn, useFormikContext } from "formik";
import { Grid, TextField } from "@mui/material";
import { PropertyWithId } from "../PropertyEditView";
import DebouncedTextField from "../../form/components/DebouncedTextField";

export function BasePropertyField({
                                      showErrors,
                                      disabledId,
                                      existingPropertyKeys,
                                      disabled
                                  }: {
    showErrors: boolean,
    disabledId: boolean,
    existingPropertyKeys?: string[];
    disabled: boolean;
}) {

    const {
        values,
        setFieldValue,
        handleChange,
        touched,
        errors,
        dirty,
        isSubmitting,
        handleSubmit
    } = useFormikContext<PropertyWithId>();

    const name = "name";
    const nameError = showErrors && getIn(errors, name);

    const id = "id";
    const idError = showErrors && getIn(errors, id);

    const description = "description";
    const descriptionError = showErrors && getIn(errors, description);

    return (
        <>

            <Grid item>
                <Field name={name}
                       as={DebouncedTextField}
                       validate={validateName}
                       label={"Field name"}
                       required
                       disabled={disabled}
                       fullWidth
                       helperText={nameError}
                       error={Boolean(nameError)}/>
            </Grid>

            <Grid item>
                <Field name={id}
                       as={TextField}
                       label={"ID"}
                       validate={(value:string) => validateId(value, existingPropertyKeys)}
                       disabled={disabledId || disabled}
                       required
                       fullWidth
                       helperText={idError}
                       size="small"
                       error={Boolean(idError)}/>
            </Grid>

            <Grid item>
                <Field name={description}
                       as={DebouncedTextField}
                       label={"Description"}
                       fullWidth
                       disabled={disabled}
                       helperText={descriptionError}
                       error={Boolean(descriptionError)}/>
            </Grid>

        </>
    );

}

const idRegEx = /^(?:[a-zA-Z]+_)*[a-zA-Z0-9]+$/;

function validateId(value: string, existingpropertyKeys?: string[]) {

    let error;
    if (!value) {
        error = "You must specify an id for the field";
    }
    if (!value.match(idRegEx)) {
        error = "The id can only contain letters, numbers and underscores (_), and not start with a number";
    }
    if (existingpropertyKeys && existingpropertyKeys.includes(value)) {
        error = "There is another field with this ID already";
    }
    return error;
}

function validateName(value: string) {
    let error;
    if (!value) {
        error = "You must specify a title for the field";
    }
    return error;
}
