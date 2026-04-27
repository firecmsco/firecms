import React from "react";

import { Field, FormexFieldProps } from "@firecms/formex";
import { SwitchControl } from "../../SwitchControl";
import { useTranslation } from "@firecms/core";

export function AdvancedPropertyValidation({ disabled }: {
    disabled: boolean
}) {

    const { t } = useTranslation();

    const columnWidth = "columnWidth";
    const hideFromCollection = "hideFromCollection";
    const readOnly = "readOnly";
    const nullable = "nullable";

    return (

        <div className={"grid grid-cols-12 gap-2"}>
            <div className={"col-span-12"}>
                <Field type="checkbox" name={hideFromCollection}>
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            label={t("hide_from_collection")}
                            size={"medium"}
                            disabled={disabled}
                            form={form}
                            tooltip={t("hide_from_collection_tooltip")}
                            field={field}/>
                    }}
                </Field>
            </div>

            <div className={"col-span-12"}>
                <Field name={readOnly}
                       type="checkbox">
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            label={t("read_only")}
                            size={"medium"}
                            disabled={disabled}
                            tooltip={t("read_only_tooltip")}
                            form={form}
                            field={field}/>
                    }}
                </Field>
            </div>

            <div className={"col-span-12"}>
                <Field name={nullable}
                       type="checkbox">
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            label={t("nullable")}
                            size={"medium"}
                            disabled={disabled}
                            tooltip={t("nullable_tooltip")}
                            form={form}
                            field={field}/>
                    }}
                </Field>
            </div>
        </div>
    );
}
