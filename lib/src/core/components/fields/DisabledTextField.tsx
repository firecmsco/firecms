import React from "react";
import TTypography from "../../../migrated/TTypography";
import TInputLabel from "../../../migrated/TInputLabel";

export function DisabledTextField<T extends string | number>({
                                                                 label,
                                                                 small,
                                                                 value
                                                             }: {
    label: React.ReactNode,
    small?: boolean,
    value: T
}) {

    return <div
        className={`relative bg-field-disabled dark:bg-field-disabled-dark rounded-md w-full ${small ? 'h-12' : 'h-16'} text-textDisabled dark:text-textDisabledDark`}>
        <TInputLabel
            shrink={Boolean(value)}
            className="absolute left-0 top-1 pointer-events-none">{label}</TInputLabel>
        <div
            className={`p-8 overflow-auto ${label ? "pt-8 pb-2" : small ? "p-3" : "px-3"}`}>
            <TTypography variant={"body1"}
                         className="font-inherit">{value}</TTypography>
        </div>
    </div>;
}
