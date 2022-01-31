import React, { useEffect, useMemo, useRef } from "react";

import { getIn, useFormikContext } from "formik";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableRow,
    Typography
} from "@mui/material";
import { EnumValues, NumberProperty, StringProperty } from "../../../../models";
import { resolveEnum } from "../../../utils";
import { useSchemaRegistry } from "../../../../hooks/useSchemaRegistry";
import { toSnakeCase } from "../../../util/strings";

function EnumEntry({ id }: { id: string }) {

    const previousId = useRef(id);

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const value = getIn(values, id);

    // useEffect(() => {
    //     const idTouched = getIn(touched, id);
    //     if (!idTouched && isNewSchema && value) {
    //         setFieldValue("id", toSnakeCase(value))
    //     }
    // }, [value, touched]);
    //
    // useEffect(() => {
    //
    //     setFieldValue(FIELD_NAME, undefined)
    //     const idTouched = getIn(touched, "id");
    //     if (!idTouched && isNewSchema && values.title) {
    //         setFieldValue("id", toSnakeCase(values.title))
    //     }
    // }, [values.id]);

    return <TableRow>
        <TableCell component="th" scope="row">
            {id}
        </TableCell>
        <TableCell component="th" scope="row">
            {value}
        </TableCell>
    </TableRow>;
}

export function EnumPropertyField() {

    const {
        values,
        handleChange,
        errors,
        touched
    } = useFormikContext<StringProperty | NumberProperty>();

    const schemaRegistry = useSchemaRegistry();

    const enumValues: EnumValues = useMemo(() => {
        if (!values.enumValues || typeof values.enumValues === "boolean")
            return {} as EnumValues;
        return resolveEnum(values.enumValues, schemaRegistry.enumConfigs) ?? {} as EnumValues;
    }, [schemaRegistry.enumConfigs, values.enumValues]);

    return (
        <>
            <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                Values
            </Typography>

            <TableContainer component={Paper} variant={"outlined"}
                            sx={{ p: 2, mt: 1 }}>
                <Table>
                    <TableBody>

                        {Object.entries(enumValues).map(([value, label]) => {
                            return (
                                <EnumEntry key={value}
                                           id={value}/>
                            )
                        })}

                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <Button>New</Button>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

        </>
    );
}
