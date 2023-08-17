import React, { useEffect, useState } from "react";
import { DataType, EntityReference, FieldProps, GeoPoint } from "../../types";

import { ArrayContainer, getDefaultValueForDataType, getIconForProperty, } from "../../core";
import { FieldHelperText, LabelWithIcon } from "../components";
import {
    BooleanSwitchWithLabel,
    Button,
    DateTimeField,
    ExpandablePanel,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    Typography
} from "../../components";
import { AddIcon, ArrowDropDownIcon, RemoveIcon } from "../../icons";

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
                                                                        error,
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
        required={property.validation?.required}
        title={property.name}
        className={"text-text-secondary dark:text-text-secondary-dark"}/>;

    return (
        <>

            {!tableMode && <ExpandablePanel initiallyExpanded={expanded}
                                            title={title}
                                            className={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}>{mapFormView}</ExpandablePanel>}

            {tableMode && mapFormView}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}

interface MapEditViewParams<T extends Record<string, any>> {
    value: T;
    setValue: (value: (T | null)) => void;
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

    const updateDataType = (rowId: number, dataType: DataType) => {
        if (!rowId) {
            console.warn("No key selected for data type update");
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
            [internalState.find((row) => row[0] === rowId)?.[1].key ?? ""]: getDefaultValueForDataType(dataType)
        })
    };

    return <div className="py-1 flex flex-col gap-1">
        {internalState
            .map(([rowId, {
                    key: fieldKey,
                    dataType
                }], index) => {
                    const entryValue = fieldKey ? value[fieldKey] : "";
                    const onFieldKeyChange = (newKey: string) => {

                        setInternalState(internalState.map((currentRowId) => {
                            if (currentRowId[0] === rowId) {
                                return [rowId, {
                                    key: newKey ?? "",
                                    dataType: currentRowId[1].dataType
                                }];
                            }
                            return currentRowId;
                        }));

                        if (typeof value === "object" && newKey in value) {
                            // if the key is already there, don't delete the previous value
                            return;
                        }

                        const newValue = { ...value };
                        if (originalValue.current && fieldKey in originalValue.current) {
                            // @ts-ignore
                            newValue[fieldKey] = undefined; // set to undefined to remove from the object, the datasource will remove it from the backend
                        } else {
                            // @ts-ignore
                            delete newValue[fieldKey];
                        }
                        setValue({
                            ...newValue,
                            [newKey ?? ""]: entryValue
                        });
                    };
                    return <MapKeyValueRow rowId={rowId}
                                           key={rowId}
                                           fieldKey={fieldKey}
                                           value={value}
                                           onDeleteClick={() => {
                                               const newValue = { ...value };
                                               if (originalValue.current && fieldKey in originalValue.current) {
                                                   // @ts-ignore
                                                   newValue[fieldKey] = undefined;
                                               } else {
                                                   // @ts-ignore
                                                   delete newValue[fieldKey];
                                               }
                                               setInternalState(internalState.filter((currentRowId) => currentRowId[0] !== rowId));
                                               setValue({
                                                   ...newValue
                                               });
                                           }}
                                           onFieldKeyChange={onFieldKeyChange}
                                           setValue={setValue}
                                           entryValue={entryValue}
                                           dataType={dataType}
                                           disabled={disabled}
                                           updateDataType={updateDataType}/>;
                }
            )}

        <Button variant={"text"}
                size={"small"}
                color="primary"
                className="w-full"
                disabled={disabled}
                startIcon={<AddIcon/>}
                onClick={(e) => {
                    e.preventDefault();
                    setValue({
                        ...value,
                        "": null
                    });
                    setInternalState([...internalState, [getRandomId(), {
                        key: "",
                        dataType: "string"
                    }]]);
                }
                }>
            {fieldName ? `Add to ${fieldName}` : "Add"}
        </Button>

    </div>;
}

function MapKeyValueRow<T extends Record<string, any>>({
                                                           rowId,
                                                           fieldKey,
                                                           value,
                                                           onFieldKeyChange,
                                                           onDeleteClick,
                                                           setValue,
                                                           entryValue,
                                                           dataType,
                                                           updateDataType,
                                                           disabled
                                                       }: {
    rowId: number,
    fieldKey: string,
    value: T,
    onFieldKeyChange: (newKey: string) => void,
    onDeleteClick: () => void,
    setValue: (value: (T | null)) => void,
    entryValue: any,
    dataType: DataType,
    disabled?: boolean,
    updateDataType: (rowId: number, dataType: DataType) => void
}) {

    function buildInput(entryValue: any, fieldKey: string, dataType: DataType) {
        if (dataType === "string" || dataType === "number") {
            return <TextField
                key={dataType}
                placeholder={"value"}
                value={entryValue}
                type={dataType === "number" ? "number" : "text"}
                size={"small"}
                disabled={disabled || !fieldKey}
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
        } else if (dataType === "date") {
            return <DateTimeField value={entryValue}
                                  size={"small"}
                                  disabled={disabled || !fieldKey}
                                  onChange={(date) => {
                                      setValue({
                                          ...value,
                                          [fieldKey]: date
                                      });
                                  }}/>;
        } else if (dataType === "boolean") {
            return <BooleanSwitchWithLabel value={entryValue}
                                           size={"small"}
                                           position={"start"}
                                           disabled={disabled || !fieldKey}
                                           onValueChange={(newValue) => {
                                               setValue({
                                                   ...value,
                                                   [fieldKey]: newValue
                                               });
                                           }}/>;
        } else if (dataType === "array") {
            return <div
                className="ml-1 pl-1 border-l border-solid border-current"
                style={{ borderWidth: "1px" }}>
                <ArrayContainer value={entryValue}
                                newDefaultEntry={""}
                                droppableId={rowId.toString()}
                                addLabel={fieldKey ? `Add to ${fieldKey}` : "Add"}
                                size={"small"}
                                disabled={disabled || !fieldKey}
                                includeAddButton={true}
                                onValueChange={(newValue) => {
                                    setValue({
                                        ...value,
                                        [fieldKey]: newValue
                                    });
                                }}
                                buildEntry={(index, internalId) => {
                                    return <ArrayKeyValueRow
                                        index={index}
                                        id={internalId}
                                        value={entryValue[index]}
                                        disabled={disabled || !fieldKey}
                                        setValue={(newValue) => {
                                            const newArrayValue = [...entryValue];
                                            newArrayValue[index] = newValue;
                                            setValue({
                                                ...value,
                                                [fieldKey]: newArrayValue
                                            });
                                        }}
                                    />
                                }}/>
            </div>;
        } else if (dataType === "map") {
            return <div
                className="ml-1 pl-1 border-l border-solid border-opacity-25"
                style={{ borderColor: "currentColor" }}>
                <MapEditView value={entryValue}
                             fieldName={fieldKey}
                             setValue={(updatedValue) => {
                                 setValue({
                                     ...value,
                                     [fieldKey]: updatedValue
                                 });
                             }}/>
            </div>;
        } else {
            return <Typography
                variant={"caption"}>
                {`Data type ${dataType} not supported yet`}
            </Typography>;
        }
    }

    function doUpdateDataType(dataType: DataType) {
        updateDataType(rowId, dataType);
    }

    return (<>
            <Typography key={rowId.toString()}
                        component={"div"}
                        className="font-mono flex flex-row gap-1 items-center">
                <div className="w-[200px] max-w-[25%]">
                    <TextField
                        value={fieldKey}
                        placeholder={"key"}
                        disabled={disabled || Boolean(entryValue)}
                        size={"small"}
                        onChange={(event) => {
                            onFieldKeyChange(event.target.value);
                        }}/>
                </div>

                <div className="flex-grow">
                    {(dataType !== "map" && dataType !== "array") && buildInput(entryValue, fieldKey, dataType)}
                </div>
                <Menu
                    trigger={<IconButton size={"small"}
                                         className="h-7 w-7">
                        <ArrowDropDownIcon/>
                    </IconButton>}
                >
                    <MenuItem dense
                              onClick={() => doUpdateDataType("string")}>string</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("number")}>number</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("boolean")}>boolean</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("date")}>date</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("map")}>map</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("array")}>array</MenuItem>
                </Menu>

                <IconButton aria-label="delete"
                            size={"small"}
                            onClick={onDeleteClick}
                            className="h-7 w-7">
                    <RemoveIcon size={"small"}/>
                </IconButton>
            </Typography>

            {(dataType === "map" || dataType === "array") && buildInput(entryValue, fieldKey, dataType)}

        </>

    );
}

function ArrayKeyValueRow<T>({
                                 id,
                                 index,
                                 value,
                                 setValue
                             }: {
    id: number,
    index: number,
    value: T,
    setValue: (value: T | null) => void,
    disabled?: boolean,
}) {

    const [selectedDataType, setSelectedDataType] = useState<DataType>(getDataType(value) ?? "string");

    function doUpdateDataType(dataType: DataType) {
        setSelectedDataType(dataType);
    }

    function buildInput(entryValue: any, dataType: DataType) {
        if (dataType === "string" || dataType === "number") {
            return <TextField value={entryValue}
                              type={dataType === "number" ? "number" : "text"}
                              size={"small"}
                              onChange={(event) => {
                                  if (dataType === "number") {
                                      const numberValue = event.target.value ? parseFloat(event.target.value) : undefined;
                                      if (numberValue && isNaN(numberValue)) {
                                          setValue(null);
                                      } else if (numberValue !== undefined && numberValue !== null) {
                                          setValue(numberValue as T);
                                      } else {
                                          setValue(null);
                                      }
                                  } else {
                                      setValue(event.target.value as T);
                                  }
                              }}/>;
        } else if (dataType === "date") {
            return <DateTimeField value={entryValue}
                                  size={"small"}
                                  onChange={(date) => {
                                      setValue(date as T);
                                  }}/>;
        } else if (dataType === "boolean") {
            return <BooleanSwitchWithLabel value={entryValue}
                                           size={"small"}
                                           position={"start"}
                                           onValueChange={(v) => {
                                               setValue(v as T);
                                           }}/>;
        } else if (dataType === "array") {
            return <Typography variant={"caption"}>
                Arrays of arrays are not supported.
            </Typography>;
        } else if (dataType === "map") {
            return <div className="ml-1 pl-1 border-l border-solid"
                        style={{ borderColor: "currentColor" }}>
                <MapEditView value={entryValue}
                             setValue={(updatedValue) => {
                                 setValue(updatedValue);
                             }}/>
            </div>;
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
                        className="font-mono flex min-h-12 flex-row gap-1 items-center">

                <div className="flex-grow">
                    {selectedDataType !== "map" && buildInput(value, selectedDataType)}
                </div>

                <Menu
                    trigger={<IconButton size={"small"}
                                         className="h-7 w-7">
                        <ArrowDropDownIcon/>
                    </IconButton>}>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("string")}>string</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("number")}>number</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("boolean")}>boolean</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("map")}>map</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdateDataType("date")}>date</MenuItem>
                </Menu>

            </Typography>

            {selectedDataType === "map" && buildInput(value, selectedDataType)}

        </>

    );
}


function getRandomId() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}

function getDataType(value: any): DataType | undefined {
    if (typeof value === "string" || value === null) {
        return "string";
    } else if (typeof value === "number") {
        return "number";
    } else if (typeof value === "boolean") {
        return "boolean";
    } else if (Array.isArray(value)) {
        return "array";
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
