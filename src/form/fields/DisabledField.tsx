import { EntitySchema } from "../../models";
import { Box, FormControl, FormHelperText, Paper } from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "../form_props";
import PreviewComponent from "../../preview/PreviewComponent";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";

type DisabledFieldProps = CMSFieldProps<any> ;

export default function DisabledField<S extends EntitySchema>({  field, property, includeDescription }: DisabledFieldProps) {

    const classes = formStyles();
    const value = field.value;
    const hasValue = value instanceof Array ? value.length > 0 : !!value;

    return (

        <FormControl fullWidth disabled={true} >

            <FormHelperText filled
                            required={property.validation?.required}>
                <LabelWithIcon scaledIcon={false} property={property}/>
            </FormHelperText>

            <Paper
                   className={`${classes.paper} ${classes.greyPaper} ${classes.largePadding}`}
                   variant={"outlined"}>

                    {hasValue &&
                    <PreviewComponent name={field.name}
                                      value={value}
                                      property={property}
                                      small={false}/>}

                    {!hasValue && <Box>No value set</Box>}

            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

        </FormControl>
    );
}
