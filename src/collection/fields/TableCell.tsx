import {
    ArrayProperty,
    Entity,
    EntitySchema,
    EntityStatus,
    NumberProperty,
    Property,
    StringProperty,
    TimestampProperty
} from "../../models";
import React, { useEffect, useState } from "react";
import {
    IconButton,
    Tooltip,
    TooltipProps,
    withStyles
} from "@material-ui/core";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { mapPropertyToYup } from "../../form/validation";
import { saveEntity } from "../../firebase";
import clsx from "clsx";
import OverflowingCell from "../OverflowingCell";
import { getPreviewSizeFrom } from "../../preview/PreviewComponentProps";
import { SelectedCell, useSelectedCellContext } from "../SelectedCellContext";
import { TableInput } from "./TableInput";
import { TableSelect } from "./TableSelect";
import { NumberTableInput } from "./TableNumberInput";
import { TableSwitch } from "./TableSwitch";
import { TableDateField } from "./TableDateField";
import ErrorBoundary from "../../components/ErrorBoundary";
import { PreviewComponent } from "../../preview";
import { StyleProps, useCellStyles } from "./styles";

const ErrorTooltip = withStyles({
    arrow: {
        color: "#ff1744"
    },
    tooltip: {
        margin: "0 8px",
        backgroundColor: "#ff1744"
    }
})(Tooltip) as React.FunctionComponent<TooltipProps>;


interface TableCellProps<T, S extends EntitySchema<string>> {
    tableKey: string,
    name: keyof S["properties"],
    editEnabled: boolean,
    path: string,
    entity: Entity<S>,
    columnIndex: number,
    rowIndex: number,
    schema: S,
    value: T
    property: Property<T>,
    width: number;
    height: number;
}

export function TableCell<T, S extends EntitySchema>({
                                                         tableKey,
                                                         name,
                                                         path,
                                                         editEnabled,
                                                         entity,
                                                         columnIndex,
                                                         rowIndex,
                                                         schema,
                                                         value,
                                                         property,
                                                         size,
                                                         align,
                                                         width,
                                                         height
                                                     }: TableCellProps<T, S> & StyleProps) {

    const [internalValue, setInternalValue] = useState<any | null>(value);
    const [error, setError] = useState<Error | undefined>();
    const disabled = !!property.disabled || !editEnabled;
    const classes = useCellStyles({ size, align, disabled });

    const selector = React.createRef<HTMLDivElement>();

    const selectedCell: SelectedCell = useSelectedCellContext();

    const selected = selectedCell.tableKey === tableKey
        && selectedCell.columnIndex === columnIndex
        && selectedCell.rowIndex === rowIndex;

    const focused = selected && selectedCell.focused;

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        select();
    };

    const onDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        select();
        openPopup();
    };

    const select = () => {
        const cellRect = selector && selector?.current?.getBoundingClientRect();
        if (!selected && cellRect)
            selectedCell.select({
                tableKey,
                columnIndex,
                rowIndex,
                width,
                height,
                entity,
                cellRect,
                fieldProps: {
                    name: name as string,
                    property,
                    includeDescription: false,
                    underlyingValueHasChanged: false,
                    entitySchema: schema,
                    tableMode: true,
                    partOfArray: false,
                    autoFocus: true
                }
            });
    };

    const validation = mapPropertyToYup(property);

    const onSaveSuccess = (entity: Entity<S>) => {

    };

    const onSaveFailure = (e: Error) => {

    };

    const onBlur = () => {
        selectedCell.focus(false);
    };

    useEffect(
        () => {
            if (value !== internalValue)
                setInternalValue(value);
        },
        [value]
    );

    useEffect(
        () => {
            if (internalValue !== value && !error)
                saveEntity({
                        collectionPath: path,
                        id: entity.id,
                        values: {
                            ...entity.values,
                            [name]: internalValue
                        },
                        schema,
                        status: EntityStatus.existing,
                        onSaveSuccess,
                        onSaveFailure
                    }
                ).then();
        },
        [internalValue]
    );


    function openPopup() {
        selectedCell.setPopup({
            open: true
        });
    }

    const updateValue = (newValue: any | null) => {

        let setValue;
        if (!newValue) {
            setValue = null;
        } else {
            setValue = newValue;
        }
        try {
            validation.validateSync(setValue);
            setError(undefined);
        } catch (e) {
            console.error(e);
            setError(e);
        }

        setInternalValue(setValue);

    };

    let component;
    let inputComponent;

    if (!disabled) {
        if (selected && property.dataType === "number") {
            const numberProperty = property as NumberProperty;
            if (numberProperty.config?.enumValues) {
                inputComponent = <TableSelect name={name as string}
                                              multiple={false}
                                              focused={selectedCell.focused}
                                              enumValues={numberProperty.config.enumValues}
                                              error={error}
                                              onBlur={onBlur}
                                              internalValue={internalValue as string | number}
                                              updateValue={updateValue}
                                              setPreventOutsideClick={selectedCell.setPreventOutsideClick}
                />;
            } else {
                inputComponent = <NumberTableInput
                    align={align}
                    error={error}
                    focused={selectedCell.focused}
                    property={numberProperty}
                    onBlur={onBlur}
                    value={internalValue as number}
                    updateValue={updateValue}
                />;
            }
        } else if (selected && property.dataType === "string") {
            const stringProperty = property as StringProperty;
            if (stringProperty.config?.enumValues) {
                inputComponent = <TableSelect name={name as string}
                                              multiple={false}
                                              focused={focused}
                                              enumValues={stringProperty.config.enumValues}
                                              error={error}
                                              onBlur={onBlur}
                                              internalValue={internalValue as string | number}
                                              updateValue={updateValue}
                                              setPreventOutsideClick={selectedCell.setPreventOutsideClick}
                />;
            } else if (!stringProperty.config?.storageMeta && !stringProperty.config?.field) {
                if (!stringProperty.config?.markdown) {
                    const multiline = !!stringProperty.config?.multiline;
                    inputComponent = <TableInput error={error}
                                                 multiline={multiline}
                                                 focused={focused}
                                                 value={internalValue as string}
                                                 updateValue={updateValue}
                    />;
                }
            }
        } else if (property.dataType === "boolean") {
            inputComponent = <TableSwitch error={error}
                                          focused={focused}
                                          internalValue={internalValue as boolean}
                                          updateValue={updateValue}
            />;
        } else if (property.dataType === "timestamp") {
            if (!(property as TimestampProperty).autoValue)
                inputComponent = <TableDateField name={name as string}
                                                 error={error}
                                                 focused={focused}
                                                 internalValue={internalValue as Date}
                                                 updateValue={updateValue}
                                                 setPreventOutsideClick={selectedCell.setPreventOutsideClick}
                />;
        } else if (property.dataType === "array") {
            const arrayProperty = (property as ArrayProperty);
            if (arrayProperty.of.dataType === "string" || arrayProperty.of.dataType === "number") {
                if (selected && arrayProperty.of.config?.enumValues) {
                    inputComponent = <TableSelect name={name as string}
                                                  multiple={true}
                                                  focused={focused}
                                                  enumValues={arrayProperty.of.config.enumValues}
                                                  error={error}
                                                  onBlur={onBlur}
                                                  internalValue={internalValue as string | number}
                                                  updateValue={updateValue}
                                                  setPreventOutsideClick={selectedCell.setPreventOutsideClick}
                    />;
                }
            }
        }
    }

    const previewComponent = (
        <OverflowingCell allowScroll={false}
                         size={size}
                         align={align}>
            <ErrorBoundary>
                <PreviewComponent
                    name={name as string}
                    value={internalValue}
                    property={property}
                    size={getPreviewSizeFrom(size)}
                    entitySchema={schema}
                />
            </ErrorBoundary>
        </OverflowingCell>);


    if (disabled) {
        return <div className={clsx(classes.tableCell, classes.disabled)}>
            {previewComponent}
        </div>;
    }

    if (!inputComponent) {
        component = previewComponent;
    } else {
        component = (
            <OverflowingCell allowScroll={true}
                             size={size}
                             align={align}>
                {inputComponent}
            </OverflowingCell>
        );
    }


    return (
        <div
            ref={selector}
            onClick={disabled ? undefined : onClick}
            onDoubleClick={disabled ? undefined : onDoubleClick}
            className={clsx(
                classes.tableCell,
                {
                    [classes.error]: error,
                    [classes.selected]: !error && selected || focused
                })}>
            {error && <div style={{
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: "20px",
                zIndex: 10
            }}>
                <ErrorTooltip
                    arrow
                    placement={"left"}
                    title={error.message}>
                    <ErrorOutlineIcon
                        fontSize={"inherit"}
                        color={"error"}
                    />
                </ErrorTooltip>
            </div>}

            {component}

            {selected && !disabled && !inputComponent && (
                <IconButton
                    color={"primary"}
                    size={"small"}
                    onClick={openPopup}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0
                    }}>
                    <svg
                        className={"MuiSvgIcon-root MuiSvgIcon-fontSizeSmall"}
                        width="20" height="20" viewBox="0 0 24 24">
                        <path className="cls-2"
                              d="M20,5a1,1,0,0,0-1-1L14,4h0a1,1,0,0,0,0,2h2.57L13.29,9.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L18,7.42V10a1,1,0,0,0,1,1h0a1,1,0,0,0,1-1Z"/>
                        <path className="cls-2"
                              d="M10.71,13.29a1,1,0,0,0-1.42,0L6,16.57V14a1,1,0,0,0-1-1H5a1,1,0,0,0-1,1l0,5a1,1,0,0,0,1,1h5a1,1,0,0,0,0-2H7.42l3.29-3.29A1,1,0,0,0,10.71,13.29Z"/>
                    </svg>
                </IconButton>
            )}
        </div>
    );

}

// export default TableCell;
export default React.memo<TableCellProps<any, any> & StyleProps>(TableCell);


