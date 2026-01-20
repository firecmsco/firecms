import React, { useMemo } from "react";
import { getIn, useFormex } from "@firecms/formex";
import { EnumValueConfig, resolveEnumValues, useSnackbarController } from "@firecms/core";
import { Select, SelectItem } from "@firecms/ui";
import { EnumForm } from "../EnumForm";
import { StringPropertyValidation } from "./validation/StringPropertyValidation";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { PropertyWithId } from "../PropertyEditView";

export function EnumPropertyField({
    multiselect,
    updateIds,
    disabled,
    showErrors,
    allowDataInference,
    getData
}: {
    multiselect: boolean;
    updateIds: boolean;
    disabled: boolean;
    showErrors: boolean;
    allowDataInference?: boolean;
    getData?: () => Promise<object[]>;
}) {

    const {
        values,
        setFieldError,
        setFieldValue
    } = useFormex<PropertyWithId>();

    const snackbarContext = useSnackbarController();

    const enumValuesPath = multiselect ? "of.enumValues" : "enumValues";

    const defaultValue = getIn(values, "defaultValue");

    const valuesEnumValues = getIn(values, enumValuesPath);
    const enumValues: EnumValueConfig[] = useMemo(() => {
        if (!valuesEnumValues || typeof valuesEnumValues === "boolean")
            return [] as EnumValueConfig[];
        return resolveEnumValues(valuesEnumValues) ?? [] as EnumValueConfig[];
    }, [valuesEnumValues]);

    const onValuesChanged = (value: EnumValueConfig[]) => {
        if (!values)
            return;
        setFieldValue(enumValuesPath, value);
        if (!multiselect) {
            const enumIds = value.filter(v => Boolean(v?.id)).map((v: any) => v.id);
            if (defaultValue && !enumIds.includes(defaultValue)) {
                setFieldValue("defaultValue", undefined);
                snackbarContext.open({
                    type: "warning",
                    message: "Default value was cleared"
                })
            }
        }
    };

    return (
        <>
            <div className={"col-span-12"}>
                <EnumForm enumValues={enumValues}
                    updateIds={updateIds}
                    disabled={disabled}
                    allowDataInference={allowDataInference}
                    onError={(hasError) => {
                        setFieldError(enumValuesPath, hasError ? "This enum property is missing some values" : undefined);
                    }}
                    getData={getData && values.id
                        ? () => getData()
                            .then(res => res.map(entry => getIn(entry, values.id!)).filter(Boolean))
                        : undefined}
                    onValuesChanged={onValuesChanged} />
            </div>

            <div className={"col-span-12"}>

                <ValidationPanel>
                    {!multiselect &&
                        <StringPropertyValidation disabled={disabled}
                            showErrors={showErrors} />}
                    {multiselect &&
                        <ArrayPropertyValidation disabled={disabled} />}
                </ValidationPanel>

            </div>

            {!multiselect && <div className={"col-span-12"}>

                <Select
                    disabled={disabled}
                    position={"item-aligned"}
                    fullWidth={true}
                    onValueChange={(value: string) => {
                        setFieldValue("defaultValue", value);
                    }}
                    size={"large"}
                    label={"Default value"}
                    value={defaultValue ?? ""}>
                    {enumValues
                        .filter((enumValue) => Boolean(enumValue?.id))
                        .map((enumValue) => (
                            <SelectItem key={enumValue.id}
                                value={enumValue.id?.toString()}>
                                {enumValue.label}
                            </SelectItem>
                        ))}
                </Select>

            </div>}
        </>
    );
}
