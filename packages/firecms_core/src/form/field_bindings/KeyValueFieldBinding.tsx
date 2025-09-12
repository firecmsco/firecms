import React, { useEffect, useState } from "react";
import { DataType, FieldProps, GeoPoint, MapProperty } from "@firecms/types";

import { ArrayContainer } from "../../components";
import { FieldHelperText, LabelWithIconAndTooltip } from "../components";
import {
    AddIcon,
    ArrowDropDownIcon,
    BooleanSwitchWithLabel,
    Button,
    cls,
    DateTimeField,
    defaultBorderMixin,
    ExpandablePanel,
    IconButton,
    Menu,
    MenuItem,
    RemoveIcon,
    TextField,
    Typography
} from "@firecms/ui";
import { getIconForProperty } from "../../util";
import { useCustomizationController } from "../../hooks";
import { getIn } from "@firecms/formex";
import { getDefaultValueFortype } from "@firecms/common";

type MapEditViewRowState = [number, {
    key: string,
    type: DataType
}];

/**
 * Field that allows edition of key value pairs.
 *
 * @group Form fields
 */
export function KeyValueFieldBinding({
                                         propertyKey,
                                         value,
                                         showError,
                                         error,
                                         disabled,
                                         property,
                                         setValue,
                                         minimalistView,
                                         includeDescription,
                                         underlyingValueHasChanged,
                                         autoFocus,
                                         context
                                     }: FieldProps<MapProperty>) {

    const expanded = (property.expanded === undefined ? true : property.expanded) || autoFocus;

    if (!property.keyValue) {
        throw Error(`Your property ${propertyKey} needs to have the 'keyValue' prop in order to use this field binding`);
    }

    const initialValues = getIn(context.formex.initialValues, propertyKey);

    const mapFormView = <MapEditView value={value}
                                     setValue={setValue}
                                     disabled={disabled}
                                     initialValue={initialValues}
                                     fieldName={property.name ?? propertyKey}/>;

    const title = <LabelWithIconAndTooltip
        propertyKey={propertyKey}
        icon={getIconForProperty(property, "small")}
        required={property.validation?.required}
        title={property.name ?? propertyKey}
        className={"text-text-secondary dark:text-text-secondary-dark"}/>;

    return (
        <>

            {!minimalistView && <ExpandablePanel initiallyExpanded={expanded}
                                                 title={title}
                                                 innerClassName={"px-2 md:px-4 pb-2 md:pb-4 pt-1 md:pt-2"}>{mapFormView}</ExpandablePanel>}

            {minimalistView && mapFormView}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}

interface MapEditViewParams<T extends Record<string, any>> {
    value?: T;
    initialValue?: T;
    setValue: (value: (T | null)) => void;
    fieldName?: string,
    disabled?: boolean
}

function MapEditView<T extends Record<string, any>>({
                                                        value,
                                                        initialValue,
                                                        setValue,
                                                        fieldName,
                                                        disabled
                                                    }: MapEditViewParams<T>) {
    const [internalState, setInternalState] = React.useState<MapEditViewRowState[]>(
        Object.keys(initialValue ?? {}).map((key) => [getRandomId(), {
            key,
            type: gettype(initialValue?.[key]) ?? "string"
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
                type: gettype(value?.[key]) ?? "string"
            }]);
        });
        keysToRemove.forEach((key) => {
            const index = newRowIds.findIndex(([id, { key: k }]) => k === key);
            newRowIds.splice(index, 1);
        });
        setInternalState(newRowIds);
    }, [value]);

    const updatetype = (rowId: number, type: DataType) => {
        if (!rowId) {
            console.warn("No key selected for data type update");
            return;
        }
        setInternalState(internalState.map((row) => {
            if (row[0] === rowId) {
                return [row[0], {
                    key: row[1].key,
                    type
                }];
            }
            return row;
        }));
        setValue({
            ...(value ?? {} as T),
            [internalState.find((row) => row[0] === rowId)?.[1].key ?? ""]: getDefaultValueFortype(type)
        })
    };

    return <div className="py-1 flex flex-col gap-1">
        {internalState
            .map(([rowId, {
                    key: fieldKey,
                    type
                }], index) => {
                    const entryValue = fieldKey ? value?.[fieldKey] : "";
                    const onFieldKeyChange = (newKey: string) => {

                        setInternalState(internalState.map((currentRowId) => {
                            if (currentRowId[0] === rowId) {
                                return [rowId, {
                                    key: newKey ?? "",
                                    type: currentRowId[1].type
                                }];
                            }
                            return currentRowId;
                        }));

                        if (typeof value === "object" && newKey in value) {
                            // if the key is already there, don't delete the previous value
                            return;
                        }

                        const newValue = { ...(value ?? {}) } as T;
                        if (typeof initialValue === "object" && fieldKey in initialValue) {
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
                                           value={value ?? {} as T}
                                           onDeleteClick={() => {
                                               const newValue = { ...(value ?? {}) as T };
                                               if (initialValue && fieldKey in initialValue) {
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
                                           type={type}
                                           disabled={disabled}
                                           updatetype={updatetype}/>;
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
                        ...(value ?? {} as T),
                        "": null
                    });
                    setInternalState([...internalState, [getRandomId(), {
                        key: "",
                        type: "string"
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
                                                           type,
                                                           updatetype,
                                                           disabled
                                                       }: {
    rowId: number,
    fieldKey: string,
    value: T,
    onFieldKeyChange: (newKey: string) => void,
    onDeleteClick: () => void,
    setValue: (value: (T | null)) => void,
    entryValue: any,
    type: DataType,
    disabled?: boolean,
    updatetype: (rowId: number, type: DataType) => void
}) {

    const { locale } = useCustomizationController();

    function buildInput(entryValue: any, fieldKey: string, type: DataType) {
        if (type === "string" || type === "number") {
            return <TextField
                key={type}
                placeholder={"value"}
                value={entryValue}
                type={type === "number" ? "number" : "text"}
                size={"medium"}
                disabled={disabled || !fieldKey}
                onChange={(event) => {
                    if (type === "number") {
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
        } else if (type === "date") {
            return <DateTimeField value={entryValue}
                                  size={"medium"}
                                  locale={locale}
                                  disabled={disabled || !fieldKey}
                                  onChange={(date) => {
                                      setValue({
                                          ...value,
                                          [fieldKey]: date
                                      });
                                  }}/>;
        } else if (type === "boolean") {
            return <BooleanSwitchWithLabel value={entryValue}
                                           size={"medium"}
                                           position={"start"}
                                           disabled={disabled || !fieldKey}
                                           onValueChange={(newValue) => {
                                               setValue({
                                                   ...value,
                                                   [fieldKey]: newValue
                                               });
                                           }}/>;
        } else if (type === "array") {
            return <div
                className={cls(defaultBorderMixin, "ml-2 pl-2 border-l border-solid")}>
                <ArrayContainer value={entryValue}
                                newDefaultEntry={""}
                                droppableId={rowId.toString()}
                                addLabel={fieldKey ? `Add to ${fieldKey}` : "Add"}
                                size={"small"}
                                disabled={disabled || !fieldKey}
                                canAddElements={true}
                                onValueChange={(newValue) => {
                                    setValue({
                                        ...value,
                                        [fieldKey]: newValue
                                    });
                                }}
                                buildEntry={({
                                                 index,
                                                 internalId
                                             }) => {
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
        } else if (type === "map") {
            return <div
                className={cls(defaultBorderMixin, "ml-2 pl-2 border-l border-solid")}>
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
                {`Data type ${type} not supported yet`}
            </Typography>;
        }
    }

    function doUpdatetype(type: DataType) {
        updatetype(rowId, type);
    }

    return (<>
            <Typography key={rowId.toString()}
                        component={"div"}
                        className="font-mono flex flex-row gap-1">
                <div className="w-[300px] max-w-[30%]">
                    <TextField
                        value={fieldKey}
                        placeholder={"key"}
                        disabled={disabled || (entryValue !== undefined && entryValue !== null && entryValue !== "")}
                        size={"medium"}
                        onChange={(event) => {
                            onFieldKeyChange(event.target.value);
                        }}/>
                </div>

                <div className="grow">
                    {(type !== "map" && type !== "array") && buildInput(entryValue, fieldKey, type)}
                </div>
                <div className={"flex flex-col"}>
                    <Menu
                        trigger={<IconButton size={"smallest"}>
                            <ArrowDropDownIcon size={"small"}/>
                        </IconButton>}
                    >
                        <MenuItem dense
                                  onClick={() => doUpdatetype("string")}>string</MenuItem>
                        <MenuItem dense
                                  onClick={() => doUpdatetype("number")}>number</MenuItem>
                        <MenuItem dense
                                  onClick={() => doUpdatetype("boolean")}>boolean</MenuItem>
                        <MenuItem dense
                                  onClick={() => doUpdatetype("date")}>date</MenuItem>
                        <MenuItem dense
                                  onClick={() => doUpdatetype("map")}>map</MenuItem>
                        <MenuItem dense
                                  onClick={() => doUpdatetype("array")}>array</MenuItem>
                    </Menu>

                    <IconButton aria-label="delete"
                                size={"smallest"}
                                onClick={onDeleteClick}>
                        <RemoveIcon size={"smallest"}/>
                    </IconButton>
                </div>
            </Typography>

            {(type === "map" || type === "array") && buildInput(entryValue, fieldKey, type)}

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

    const { locale } = useCustomizationController();
    const [selectedtype, setSelectedtype] = useState<DataType>(gettype(value) ?? "string");

    function doUpdatetype(type: DataType) {
        setSelectedtype(type);
    }

    function buildInput(entryValue: any, type: DataType) {
        if (type === "string" || type === "number") {
            return <TextField value={entryValue}
                              type={type === "number" ? "number" : "text"}
                              size={"medium"}
                              onChange={(event) => {
                                  if (type === "number") {
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
        } else if (type === "date") {
            return <DateTimeField value={entryValue}
                                  size={"medium"}
                                  locale={locale}
                                  onChange={(date) => {
                                      setValue(date as T);
                                  }}/>;
        } else if (type === "boolean") {
            return <BooleanSwitchWithLabel value={entryValue}
                                           size={"small"}
                                           position={"start"}
                                           onValueChange={(v) => {
                                               setValue(v as T);
                                           }}/>;
        } else if (type === "array") {
            return <Typography variant={"caption"}>
                Arrays of arrays are not supported.
            </Typography>;
        } else if (type === "map") {
            return <div className={cls(defaultBorderMixin, "ml-2 pl-2 border-l border-solid")}>
                <MapEditView value={entryValue}
                             setValue={(updatedValue) => {
                                 setValue(updatedValue);
                             }}/>
            </div>;
        } else {
            return <Typography
                variant={"caption"}>
                {`Data type ${type} not supported yet`}
            </Typography>;
        }
    }

    return (<>
            <Typography key={id.toString()}
                        component={"div"}
                        className="font-mono flex min-h-12 flex-row gap-1 items-center">

                <div className="grow">
                    {selectedtype !== "map" && buildInput(value, selectedtype)}
                </div>

                <Menu
                    trigger={<IconButton size={"small"}
                                         className="h-7 w-7">
                        <ArrowDropDownIcon/>
                    </IconButton>}>
                    <MenuItem dense
                              onClick={() => doUpdatetype("string")}>string</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdatetype("number")}>number</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdatetype("boolean")}>boolean</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdatetype("map")}>map</MenuItem>
                    <MenuItem dense
                              onClick={() => doUpdatetype("date")}>date</MenuItem>
                </Menu>

            </Typography>

            {selectedtype === "map" && buildInput(value, selectedtype)}

        </>

    );
}

function getRandomId() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}

function gettype(value: any): DataType | undefined {
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
    } else if (value?.isEntityReference && value?.isEntityReference()) {
        return "reference";
    } else if (value instanceof GeoPoint) {
        return "geopoint";
    } else if (typeof value === "object") {
        return "map";
    }

    return undefined;
}
