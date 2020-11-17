import { EnumValues } from "../../models";
import { CustomChip } from "../../preview/components/CustomChip";
import React, { useState } from "react";
import { Checkbox, ListItemText, MenuItem, Select } from "@material-ui/core";
import { useInputStyles } from "./styles";
import { buildArrayEnumPreview } from "../../preview/components/ArrayEnumPreview";

export function TableSelect(props: {
    name: string,
    enumValues: EnumValues<number | string>,
    error: Error | undefined,
    multiple: boolean,
    internalValue: string | number | string[] | number[] | undefined,
    ref?: React.Ref<HTMLInputElement>,
    updateValue: (newValue: (string | number | string[] | number[] | undefined)) => void,
    focused: boolean,
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>,
    setPreventOutsideClick: (value: any) => void;
}) {

    const { name, enumValues, error, internalValue, ref, updateValue, multiple, setPreventOutsideClick } = props;

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

    return (
        <Select
            className={classes.select}
            classes={{ root: classes.selectRoot }}
            open={open}
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
            inputRef={ref}
            error={!!error}
            value={validValue ? internalValue : (multiple ? [] : "")}
            onChange={(evt) => {
                updateValue(evt.target.value as typeof internalValue);
            }}
            renderValue={(selected: any) =>
                Array.isArray(selected) ?
                    buildArrayEnumPreview(selected, name, enumValues, "small")
                    :
                    selected && <CustomChip
                        colorKey={typeof selected === "number" ? `${name}_${selected}` : selected as string}
                        label={enumValues[selected] || selected}
                        error={!enumValues[selected]}
                        outlined={false}
                        small={true}/>
            }>

            {Object.entries(enumValues).map(([key, value]) => {
                const chip = <CustomChip
                    colorKey={typeof key === "number" ? `${name}_${key}` : key as string}
                    label={value}
                    error={!value}
                    outlined={false}
                    small={true}/>;
                if (multiple) {
                    return (
                        <MenuItem key={`select-${key}`}
                                  value={key}
                                  dense={true}>
                            <Checkbox
                                checked={Array.isArray(internalValue) && (internalValue as any[]).includes(key)}/>
                            <ListItemText primary={chip}/>
                        </MenuItem>
                    );
                } else {
                    return (
                        <MenuItem key={`select-${key}`} value={key}
                                  dense={true}>
                            {chip}
                        </MenuItem>
                    );
                }
            })}
        </Select>
    );
}
