import { EnumValues } from "../../../models";
import { ArrayEnumPreview } from "../../../preview";
import React, { useState } from "react";
import { Checkbox, ListItemText, MenuItem, Select } from "@material-ui/core";
import { useInputStyles } from "./styles";
import { enumToObjectEntries, isEnumValueDisabled } from "../../../util/enums";
import { EnumValuesChip } from "../../../preview/components/CustomChip";

export function TableSelect(props: {
    name: string;
    enumValues: EnumValues;
    error: Error | undefined;
    multiple: boolean;
    disabled: boolean;
    small: boolean;
    internalValue: string | number | string[] | number[] | undefined;
    valueType: "string" | "number";
    updateValue: (newValue: (string | number | string[] | number[] | undefined)) => void;
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

    const classes = useInputStyles();

    const validValue = (Array.isArray(internalValue) && multiple) ||
        (!Array.isArray(internalValue) && !multiple);

    // TODO: this is bugged in MUI 4.0, change if this commit is merged https://github.com/mui-org/material-ui/commit/6cfcae3ab3b2fc1045562002752304f9cf8bdca5
    // const ref = React.createRef<HTMLInputElement>();
    // useEffect(() => {
    //     if (ref.current && focused) {
    //         ref.current?.focus({ preventScroll: true });
    //     }
    // }, [focused, ref.current]);

    return (
        <Select
            // TODO: related to prev. replace autofocus with ref, it makes the scroll jump when rendered
            autoFocus
            variant={"standard"}
            key={`table_select_${name}`}
            // inputRef={ref}
            className={classes.select}
            classes={{ root: classes.selectRoot }}
            open={open}
            disabled={disabled}
            multiple={multiple}
            onClose={handleClose}
            onOpen={handleOpen}
            fullWidth
            inputProps={{
                style: {
                    height: "100%"
                }
            }}
            disableUnderline
            error={!!error}
            value={validValue ? internalValue : (multiple ? [] : "")}
            onChange={(evt) => {
                if (valueType === "number") {
                    if (multiple) {
                        updateValue((evt.target.value as string[]).map((v) => parseFloat(v)));
                    } else {
                        updateValue(parseFloat(evt.target.value as string));
                    }
                } else if (valueType === "string") {
                    updateValue(evt.target.value as typeof internalValue);
                } else {
                    throw Error("Missing mapping in TableSelect");
                }
            }}
            renderValue={(enumKey: any) => {
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

            {enumToObjectEntries(enumValues).map(([key, labelOrConfig]) => {

                const chip = <EnumValuesChip
                    enumKey={key}
                    enumValues={enumValues}
                    small={true}/>;
                if (multiple) {
                    return (
                        <MenuItem key={`select-${name}-${key}`}
                                  value={key}
                                  disabled={isEnumValueDisabled(labelOrConfig)}
                                  dense={true}>
                            <Checkbox
                                checked={Array.isArray(internalValue) && (internalValue as any[]).includes(key)}/>
                            <ListItemText primary={chip}/>
                        </MenuItem>
                    );
                } else {
                    return (
                        <MenuItem key={`select-${name}-${key}`} value={key}
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
