import { EnumValues } from "../../models";
import { CustomChip } from "../../preview/components/CustomChip";
import React, { useState } from "react";
import { Checkbox, ListItemText, MenuItem, Select } from "@material-ui/core";
import { useInputStyles } from "./styles";
import { ArrayEnumPreview } from "../../preview/components/ArrayPropertyEnumPreview";
import { buildEnumLabel, isEnumValueDisabled } from "../../models/builders";

export function TableSelect(props: {
    name: string,
    enumValues: EnumValues<number | string>,
    error: Error | undefined,
    multiple: boolean,
    internalValue: string | number | string[] | number[] | undefined,
    updateValue: (newValue: (string | number | string[] | number[] | undefined)) => void,
    focused: boolean,
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>,
    setPreventOutsideClick: (value: any) => void;
}) {

    const { name, enumValues, error, internalValue, focused, updateValue, multiple, setPreventOutsideClick } = props;

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
    //         console.log("select focus", ref.current);
    //         ref.current?.focus({ preventScroll: true });
    //     }
    // }, [focused, ref.current]);

    return (
        <Select
            // TODO: related to prev. replace autofocus with ref, it makes the scroll jump when rendered
            autoFocus
            key={`table_select_${name}`}
            // inputRef={ref}
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
            error={!!error}
            value={validValue ? internalValue : (multiple ? [] : "")}
            onChange={(evt) => {
                updateValue(evt.target.value as typeof internalValue);
            }}
            renderValue={(selected: any) => {
                const label = buildEnumLabel(enumValues[selected]);
                return Array.isArray(selected) ?
                    <ArrayEnumPreview value={selected} name={name}
                                      enumValues={enumValues} size={"small"}/>
                    :
                    selected && <CustomChip
                        colorKey={typeof selected === "number" ? `${name}_${selected}` : selected as string}
                        label={label || selected}
                        error={!label}
                        outlined={false}
                        small={true}/>;
            }
            }>

            {Object.entries(enumValues).map(([key, value]) => {

                const label = buildEnumLabel(value);
                const chip = <CustomChip
                    colorKey={typeof key === "number" ? `${name}_${key}` : key as string}
                    label={label || key}
                    error={!label}
                    outlined={false}
                    small={true}/>;
                if (multiple) {
                    return (
                        <MenuItem key={`select-${name}-${key}`}
                                  value={key}
                                  disabled={isEnumValueDisabled(value)}
                                  dense={true}>
                            <Checkbox
                                checked={Array.isArray(internalValue) && (internalValue as any[]).includes(key)}/>
                            <ListItemText primary={chip}/>
                        </MenuItem>
                    );
                } else {
                    return (
                        <MenuItem key={`select-${name}-${key}`} value={key}
                                  disabled={isEnumValueDisabled(value)}
                                  dense={true}>
                            {chip}
                        </MenuItem>
                    );
                }
            })}
        </Select>
    );
}
