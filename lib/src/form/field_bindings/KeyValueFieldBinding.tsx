import React, { useEffect, useRef } from "react";
import { DataType, EntityReference, FieldProps, GeoPoint } from "../../types";
import {
    Box,
    Button,
    FormControl,
    Grid,
    Typography,
    IconButton
} from "@mui/material";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import ClearIcon from "@mui/icons-material/Clear";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddIcon from "@mui/icons-material/Add";

import { ExpandablePanel, getIconForProperty, TextInput } from "../../core";
import { FieldDescription, LabelWithIcon } from "../components";
import { BooleanSwitch } from "../../core/components/fields/BooleanSwitch";

type MapEditViewRowState = [number, {
    key: string,
    dataType: DataType
}];

/**
 * Field that allows edition of key value pairs.
 *
 * @category Form fields
 */
export function KeyValueFieldBinding<T extends Record<string, any>>({
                                                                        propertyKey,
                                                                        value,
                                                                        showError,
                                                                        disabled,
                                                                        property,
                                                                        setValue,
                                                                        tableMode,
                                                                        includeDescription,
                                                                        underlyingValueHasChanged,
                                                                        autoFocus,
                                                                        context
                                                                    }: FieldProps<T>) {

    const expanded = (property.expanded === undefined ? true : property.expanded) || autoFocus;

    if (!property.keyValue) {
        throw Error(`Your property ${propertyKey} needs to have the 'keyValue' prop in order to use this field binding`);
    }
    const mapFormView = <MapEditView value={value}
                                     setValue={setValue}
                                     disabled={disabled}
                                     fieldName={property.name ?? propertyKey}/>;

    const title = <LabelWithIcon
        icon={getIconForProperty(property)}
        title={property.name}/>;

    return (
        <FormControl fullWidth error={showError}>

            {!tableMode && <ExpandablePanel initiallyExpanded={expanded}
                                            title={title}>{mapFormView}</ExpandablePanel>}

            {tableMode && mapFormView}

            {includeDescription && <FieldDescription property={property}/>}

        </FormControl>
    );
}

function KeyValueRow<T>({
                            id,
                            fieldKey,
                            value,
                            originalValue,
                            setInternalState,
                            internalState,
                            setValue,
                            entryValue,
                            dataType,
                            currentMenuRowId,
                            openTypeSelectMenu
                        }: {
    id: number,
    fieldKey: string,
    value: T,
    originalValue: any,
    setInternalState: (state: MapEditViewRowState[]) => void,
    internalState: MapEditViewRowState[],
    setValue: (value: (T | null), shouldValidate?: boolean) => void,
    entryValue: any,
    dataType: DataType,
    disabled?: boolean,
    currentMenuRowId: any,
    openTypeSelectMenu: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {

    function buildInput(entryValue: any, fieldKey: string, dataType: DataType) {
        if (dataType === "string" || dataType === "number") {
            return <TextInput value={entryValue}
                              inputType={dataType === "number" ? "number" : "text"}
                              small={true}
                              onChange={(event) => {
                                  if (dataType === "number") {
                                      const numberValue = event.target.value ? parseFloat(event.target.value) : undefined;
                                      if (numberValue && isNaN(numberValue)) {
                                          setValue({
                                              ...value,
                                              [fieldKey]: null
                                          });
                                      } else if (numberValue !== undefined && numberValue !== null) {
                                          setValue({
                                              ...value,
                                              [fieldKey]: numberValue
                                          });
                                      } else {
                                          setValue({
                                              ...value,
                                              [fieldKey]: null
                                          });
                                      }
                                  } else {
                                      setValue({
                                          ...value,
                                          [fieldKey]: event.target.value
                                      });
                                  }
                              }}/>;
        } else if (dataType === "boolean") {
            return <BooleanSwitch value={entryValue}
                                  small={true}
                                  position={"start"}
                                  onChange={(event) => {
                                      const newValue = event.target.checked;
                                      setValue({
                                          ...value,
                                          [fieldKey]: newValue
                                      });
                                  }}/>;
        } else if (dataType === "map") {
            return <Box sx={theme => ({
                ml: 1,
                pl: 1,
                borderLeft: `1px solid ${theme.palette.divider}`
            })}>
                <MapEditView value={entryValue}
                             fieldName={fieldKey}
                             setValue={(updatedValue) => {
                                 setValue({
                                     ...value,
                                     [fieldKey]: updatedValue
                                 });
                             }}/>
            </Box>;
        } else {
            return <Typography
                variant={"caption"}>
                {`Data type ${dataType} not supported yet`}
            </Typography>;
        }
    }

    return (<>
            <Typography key={id.toString()}
                        component={"div"}
                        className={"mono"}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 1,
                            alignItems: "center"
                        }}>
                <Box sx={{ width: "200px", maxWidth: "25%" }}>
                    <TextInput
                        value={fieldKey}
                        small={true}
                        onChange={(event) => {

                            const newKey = event.target.value;
                            const newValue = { ...value };
                            if (originalValue.current && fieldKey in originalValue.current) {
                                // @ts-ignore
                                newValue[fieldKey] = undefined; // set to undefined to remove from the object, the datasource will remove it from the backend
                            } else {
                                // @ts-ignore
                                delete newValue[fieldKey];
                            }
                            setInternalState(internalState.map((rowId) => {
                                if (rowId[0] === id) {
                                    return [id, {
                                        key: newKey ?? "",
                                        dataType: rowId[1].dataType
                                    }];
                                }
                                return rowId;
                            }));
                            setValue({
                                ...newValue,
                                [newKey ?? ""]: entryValue
                            });
                        }}/>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    {dataType !== "map" && buildInput(entryValue, fieldKey, dataType)}
                </Box>

                <Box sx={{
                    display: "flex",
                    flexDirection: "column"
                }}>

                    <IconButton aria-label="delete" size={"small"}
                                onClick={(e) => {
                                    currentMenuRowId.current = id;
                                    openTypeSelectMenu(e);
                                }}
                                sx={{
                                    height: "24px",
                                    width: "24px"
                                }}>
                        <ArrowDropDownIcon fontSize={"small"}/>
                    </IconButton>

                    <IconButton aria-label="delete" size={"small"}
                                onClick={() => {
                                    const newValue = { ...value };
                                    if (originalValue.current && fieldKey in originalValue.current) {
                                        // @ts-ignore
                                        newValue[fieldKey] = undefined;
                                    } else {
                                        // @ts-ignore
                                        delete newValue[fieldKey];
                                    }
                                    setInternalState(internalState.filter((rowId) => rowId[0] !== id));
                                    setValue({
                                        ...newValue
                                    });
                                }}
                                sx={{
                                    height: "24px",
                                    width: "24px"
                                }}>
                        <ClearIcon fontSize={"small"}
                                   sx={{
                                       height: "12px",
                                       width: "12px"
                                   }}/>
                    </IconButton>

                </Box>
            </Typography>

            {dataType === "map" && buildInput(entryValue, fieldKey, dataType)}
        </>

    );
}

interface MapEditViewParams<T extends Record<string, any>> {
    value: T;
    setValue: (value: (T | null), shouldValidate?: boolean) => void;
    fieldName?: string,
    disabled?: boolean
}

function MapEditView<T extends Record<string, any>>({
                                                        value,
                                                        setValue,
                                                        fieldName,
                                                        disabled
                                                    }: MapEditViewParams<T>) {
    const [internalState, setInternalState] = React.useState<MapEditViewRowState[]>(
        Object.keys(value ?? {}).map((key) => [getRandomId(), {
            key,
            dataType: getDataType(value[key]) ?? "string"
        }])
    );

    useEffect(() => {
        const currentKeys = internalState.map(([id, { key }]) => key);
        const newKeys = Object.entries(value ?? {}).filter(([key, v]) => v !== undefined).map(([key]) => key);
        const keysToAdd = newKeys.filter((key) => !currentKeys.includes(key));
        const keysToRemove = currentKeys.filter((key) => !newKeys.includes(key));
        const newRowIds = [...internalState];
        keysToAdd.forEach((key) => {
            newRowIds.push([getRandomId(), {
                key,
                dataType: getDataType(value[key]) ?? "string"
            }]);
        });
        keysToRemove.forEach((key) => {
            const index = newRowIds.findIndex(([id, { key: k }]) => k === key);
            newRowIds.splice(index, 1);
        });
        setInternalState(newRowIds);
    }, [value]);

    const originalValue = React.useRef<T>(value);

    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchorEl);

    const currentMenuRowId = useRef<number | null>(null);

    const openTypeSelectMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        currentMenuRowId.current = null;
    };
    const updateDataType = (dataType: DataType) => {
        const rowId = currentMenuRowId.current;
        if (!rowId) {
            console.warn("No key selected for data type update", currentMenuRowId.current);
            return;
        }
        setInternalState(internalState.map((row) => {
            if (row[0] === rowId) {
                return [row[0], {
                    key: row[1].key,
                    dataType
                }];
            }
            return row;
        }));
        setValue({
            ...value,
            [internalState.find((row) => row[0] === rowId)?.[1].key ?? ""]: null
        })
        handleMenuClose();
    };

    return <Box sx={{
        py: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1
    }}>
        {internalState
            .map(([id, { key, dataType }], index) => {
                    const entryValue = key ? value[key] : "";
                    return <KeyValueRow id={id}
                                        key={id}
                                        fieldKey={key}
                                        value={value}
                                        originalValue={originalValue}
                                        setInternalState={setInternalState}
                                        internalState={internalState}
                                        setValue={setValue}
                                        entryValue={entryValue}
                                        dataType={dataType}
                                        disabled={disabled}
                                        currentMenuRowId={currentMenuRowId}
                                        openTypeSelectMenu={openTypeSelectMenu}/>;
                }
            )}

        <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem dense
                      onClick={() => updateDataType("string")}>string</MenuItem>
            <MenuItem dense
                      onClick={() => updateDataType("number")}>number</MenuItem>
            <MenuItem dense
                      onClick={() => updateDataType("boolean")}>boolean</MenuItem>
            <MenuItem dense onClick={() => updateDataType("map")}>map</MenuItem>
        </Menu>

        <Grid item
              xs={12}>
            <Button variant={"text"}
                    size={"small"}
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={() =>
                        setInternalState([...internalState, [getRandomId(), {
                            key: "",
                            dataType: "string"
                        }]])
                    }>
                {fieldName ? `Add to ${fieldName}` : "Add"}
            </Button>
        </Grid>

    </Box>;
}

function getRandomId() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}

function getDataType(value: any): DataType | undefined {
    if (typeof value === "string") {
        return "string";
    } else if (typeof value === "number") {
        return "number";
    } else if (typeof value === "boolean") {
        return "boolean";
    } else if (Array.isArray(value)) {
        return "date";
    } else if (value instanceof Date) {
        return "date";
    } else if (value instanceof EntityReference) {
        return "reference";
    } else if (value instanceof GeoPoint) {
        return "geopoint";
    } else if (typeof value === "object") {
        return "map";
    }

    return undefined;
}
