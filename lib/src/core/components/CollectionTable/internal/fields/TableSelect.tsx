import { EnumValueConfig } from "../../../../../models";
import { ArrayEnumPreview, EnumValuesChip } from "../../../../../preview";
import React, { useEffect, useState } from "react";
import { Checkbox, ListItemText, MenuItem, Select } from "@mui/material";
import {
    enumToObjectEntries,
    isEnumValueDisabled
} from "../../../../util/enums";

export function TableSelect(props: {
    name: string;
    enumValues: EnumValueConfig[];
    error: Error | undefined;
    multiple: boolean;
    disabled: boolean;
    small: boolean;
    internalValue: string | number | string[] | number[] | undefined;
    valueType: "string" | "number";
    updateValue: (newValue: (string | number | string[] | number[] | null)) => void;
    focused: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    setPreventOutsideClick: (value: any) => void;
}) {

    const {
        name,
        enumValues,
        error,
        internalValue,
        disabled,
        small,
        focused,
        updateValue,
        multiple,
        setPreventOutsideClick,
        valueType
    } = props;

    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => {
        setPreventOutsideClick(true);
        setOpen(true);
    };

    const handleClose = () => {
        setPreventOutsideClick(false);
        setOpen(false);
    };

    const validValue = (Array.isArray(internalValue) && multiple) ||
        (!Array.isArray(internalValue) && !multiple);

    const ref = React.createRef<HTMLInputElement>();
    useEffect(() => {
        if (ref.current && focused) {
            ref.current?.focus({ preventScroll: true });
        }
    }, [focused, ref]);

    return (
        <Select
            variant={"standard"}
            key={`table_select_${name}`}
            inputRef={ref}
            sx={{
                height: "100%"
            }}
            open={open}
            disabled={disabled}
            multiple={multiple}
            onClose={handleClose}
            onOpen={handleOpen}
            fullWidth
            inputProps={{
                sx: {
                    height: "100% !important",
                    display: "flex",
                    alignItems: "center",
                    padding: "0px 0 0px",
                    background: "transparent !important"
                }
            }}
            disableUnderline
            error={!!error}
            value={validValue
                ? (multiple ? (internalValue as any[]).map(v => v.toString()) : internalValue)
                : (multiple ? [] : "")}
            onChange={(evt) => {
                if (valueType === "number") {
                    if (multiple) {
                        const newValue = (evt.target.value as string[]).map((v) => parseFloat(v));
                        updateValue(newValue);
                    } else {
                        updateValue(parseFloat(evt.target.value as string));
                    }
                } else if (valueType === "string") {
                    if (!evt.target.value)
                        updateValue(null)
                    else
                        updateValue(evt.target.value as any);
                } else {
                    throw Error("Missing mapping in TableSelect");
                }
            }}
            renderValue={(enumKey: unknown) => {
                if (multiple && Array.isArray(enumKey)) {
                    return <ArrayEnumPreview value={enumKey}
                                             name={name}
                                             enumValues={enumValues}
                                             size={small ? "small" : "regular"}/>;
                } else {
                    return <EnumValuesChip
                        enumKey={enumKey}
                        enumValues={enumValues}
                        small={small}/>;
                }
            }
            }>

            {enumToObjectEntries(enumValues).map(([enumKey, labelOrConfig]) => {

                const chip = <EnumValuesChip
                    enumKey={enumKey}
                    enumValues={enumValues}
                    small={true}/>;
                if (multiple) {
                    return (
                        <MenuItem key={`select-${name}-${enumKey}`}
                                  value={enumKey}
                                  disabled={isEnumValueDisabled(labelOrConfig)}
                                  dense={true}>
                            <Checkbox
                                checked={Array.isArray(internalValue) && (internalValue as any[]).map(v => v.toString()).includes(enumKey.toString())}/>
                            <ListItemText primary={chip}/>
                        </MenuItem>
                    );
                } else {
                    return (
                        <MenuItem key={`select-${name}-${enumKey}`} value={enumKey}
                                  disabled={isEnumValueDisabled(labelOrConfig)}
                                  dense={true}>
                            {chip}
                        </MenuItem>
                    );
                }
            })}
        </Select>
    );
}
