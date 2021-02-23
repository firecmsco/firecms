import {
    ArrayProperty,
    CMSFormFieldProps,
    Entity,
    EntitySchema,
    EntityStatus,
    NumberProperty,
    Property,
    ReferenceProperty,
    saveEntity,
    StringProperty,
    TimestampProperty
} from "../models";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    createStyles,
    IconButton,
    makeStyles,
    Theme,
    Tooltip
} from "@material-ui/core";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { mapPropertyToYup } from "../form/validation";
import clsx from "clsx";
import OverflowingCell from "./OverflowingCell";
import { TableInput } from "./fields/TableInput";
import { TableSelect } from "./fields/TableSelect";
import { NumberTableInput } from "./fields/TableNumberInput";
import { TableSwitch } from "./fields/TableSwitch";
import { TableDateField } from "./fields/TableDateField";
import { ErrorBoundary } from "../components";
import { PreviewComponent } from "../preview";
import { CellStyleProps, useCellStyles } from "./styles";
import { TableReferenceField } from "./fields/TableReferenceField";
import { CollectionTableProps } from "./CollectionTableProps";

import firebase from "firebase/app";
import "firebase/firestore";
import { getPreviewSizeFrom } from "../preview/util";
import { useClearRestoreValue } from "../form/useClearRestoreValue";
import DisabledTableCell from "./DisabledTableCell";
import deepEqual from "deep-equal";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        arrow: {
            color: "#ff1744"
        },
        tooltip: {
            margin: "0 8px",
            backgroundColor: "#ff1744"
        }
    })
);


interface TableCellProps<T, S extends EntitySchema<Key>, Key extends string> {
    tableKey: string,
    columnIndex: number,
    rowIndex: number,
    name: string,
    path: string,
    selected: boolean,
    entity: Entity<S, Key>,
    schema: S,
    value: T,
    select: (cellRect: DOMRect | undefined) => void,
    openPopup: () => void,
    setPreventOutsideClick: (value: boolean) => void,
    focused: boolean,
    setFocused: (value: boolean) => void,
    property: Property<T>,
    height: number;
    width: number;
    CMSFormField: React.FunctionComponent<CMSFormFieldProps<S, Key>>;
    CollectionTable: React.FunctionComponent<CollectionTableProps<S, Key>>,
}


const TableCell = <T, S extends EntitySchema<Key>, Key extends string>({
                                                                           selected,
                                                                           focused,
                                                                           tableKey,
                                                                           columnIndex,
                                                                           rowIndex,
                                                                           name,
                                                                           path,
                                                                           setPreventOutsideClick,
                                                                           setFocused,
                                                                           entity,
                                                                           select,
                                                                           openPopup,
                                                                           schema,
                                                                           value,
                                                                           property,
                                                                           size,
                                                                           align,
                                                                           width,
                                                                           height,
                                                                           CMSFormField,
                                                                           CollectionTable
                                                                       }: TableCellProps<T, S, Key> & CellStyleProps) => {

    const ref = React.createRef<HTMLDivElement>();
    const [internalValue, setInternalValue] = useState<any | null>(value);

    useClearRestoreValue<T>({
        property,
        value: internalValue,
        setValue: setInternalValue
    });

    const [error, setError] = useState<Error | undefined>();

    const tooltipClasses = useStyles();
    const classes = useCellStyles({ size, align, disabled: false });

    const customField = Boolean(property.config?.field);
    const customPreview = Boolean(property.config?.customPreview);
    const disabled = Boolean(property.disabled);
    const disabledTooltip: string | undefined = typeof property.disabled === "object" ? property.disabled.disabledMessage : undefined;

    const iconRef = React.createRef<HTMLButtonElement>();
    useEffect(() => {
        if (iconRef.current && focused) {
            iconRef.current.focus({ preventScroll: true });
        }
    }, [focused]);

    const onSelect = () => {
        const cellRect = ref && ref?.current?.getBoundingClientRect();
        if (disabled) {
            select(undefined);
        } else if (!selected && cellRect) {
            select(cellRect);
        }
    };

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.detail > 1) event.preventDefault();
    };

    const onFocus = (event: React.SyntheticEvent<HTMLDivElement>) => {
        onSelect();
        event.stopPropagation();
    };

    const onDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        openPopup();
    };

    const validation = useMemo(() => mapPropertyToYup(property), [property]);

    const onSaveSuccess = (entity: Entity<any>) => {

    };

    const onSaveFailure = (e: Error) => {
        setError(e);
    };

    const onBlur = () => {
        setFocused(false);
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
            if (!deepEqual(value, internalValue) && !error) {
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
            }
        },
        [internalValue]
    );

    const updateValue = useCallback(
        (newValue: any | null) => {

            let updatedValue;
            if (newValue === undefined) {
                updatedValue = null;
            } else {
                updatedValue = newValue;
            }
            try {
                validation.validateSync(updatedValue);
                setError(undefined);
            } catch (e) {
                console.error(e);
                setError(e);
            }
            setInternalValue(updatedValue);
        },
        []
    );

    if (property.readOnly) {
        return (
            <DisabledTableCell
                tooltip={disabledTooltip}
                size={size}
                align={align}>
                <PreviewComponent
                    width={width}
                    height={height}
                    name={name}
                    value={entity.values[name]}
                    property={property}
                    size={getPreviewSizeFrom(size)}
                />
            </DisabledTableCell>
        );
    }

    let innerComponent;
    let allowScroll = false;
    let showExpandIcon = false;

    if (!customField && (!customPreview || selected)) {
        if (selected && property.dataType === "number") {
            const numberProperty = property as NumberProperty;
            if (numberProperty.config?.enumValues) {
                innerComponent = <TableSelect name={name as string}
                                              multiple={false}
                                              disabled={disabled}
                                              focused={focused}
                                              valueType={"number"}
                                              enumValues={numberProperty.config.enumValues}
                                              error={error}
                                              onBlur={onBlur}
                                              internalValue={internalValue as string | number}
                                              updateValue={updateValue}
                                              setPreventOutsideClick={setPreventOutsideClick}
                />;
            } else {
                innerComponent = <NumberTableInput
                    align={align}
                    error={error}
                    focused={focused}
                    disabled={disabled}
                    onBlur={onBlur}
                    value={internalValue as number}
                    updateValue={updateValue}
                />;
                allowScroll = true;
            }
        } else if (selected && property.dataType === "string") {
            const stringProperty = property as StringProperty;
            if (stringProperty.config?.enumValues) {
                innerComponent = <TableSelect name={name as string}
                                              multiple={false}
                                              focused={focused}
                                              disabled={disabled}
                                              valueType={"string"}
                                              enumValues={stringProperty.config.enumValues}
                                              error={error}
                                              onBlur={onBlur}
                                              internalValue={internalValue as string | number}
                                              updateValue={updateValue}
                                              setPreventOutsideClick={setPreventOutsideClick}
                />;
            } else if (!stringProperty.config?.storageMeta && !stringProperty.config?.markdown) {
                const multiline = !!stringProperty.config?.multiline;
                innerComponent = <TableInput error={error}
                                             disabled={disabled}
                                             multiline={multiline}
                                             focused={focused}
                                             value={internalValue as string}
                                             updateValue={updateValue}
                />;
                allowScroll = true;
            }
        } else if (property.dataType === "boolean") {
            innerComponent = <TableSwitch error={error}
                                          disabled={disabled}
                                          focused={focused}
                                          internalValue={internalValue as boolean}
                                          updateValue={updateValue}
            />;
        } else if (property.dataType === "timestamp") {
            if (!(property as TimestampProperty).autoValue) {
                innerComponent = <TableDateField name={name as string}
                                                 error={error}
                                                 disabled={disabled}
                                                 focused={focused}
                                                 internalValue={internalValue as Date}
                                                 updateValue={updateValue}
                                                 setPreventOutsideClick={setPreventOutsideClick}
                />;
                allowScroll = true;
            }
        } else if (property.dataType === "reference") {
            innerComponent = <TableReferenceField name={name as string}
                                                  internalValue={internalValue as firebase.firestore.DocumentReference}
                                                  updateValue={updateValue}
                                                  disabled={disabled}
                                                  size={size}
                                                  CMSFormField={CMSFormField}
                                                  CollectionTable={CollectionTable}
                                                  schema={schema}
                                                  property={property as ReferenceProperty}
                                                  setPreventOutsideClick={setPreventOutsideClick}
            />;
            allowScroll = true;
        } else if (property.dataType === "array") {
            const arrayProperty = (property as ArrayProperty);
            if (arrayProperty.of.dataType === "string" || arrayProperty.of.dataType === "number") {
                if (selected && arrayProperty.of.config?.enumValues) {
                    innerComponent = <TableSelect name={name as string}
                                                  multiple={true}
                                                  disabled={disabled}
                                                  focused={focused}
                                                  valueType={arrayProperty.of.dataType}
                                                  enumValues={arrayProperty.of.config.enumValues}
                                                  error={error}
                                                  onBlur={onBlur}
                                                  internalValue={internalValue as string | number}
                                                  updateValue={updateValue}
                                                  setPreventOutsideClick={setPreventOutsideClick}
                    />;
                    allowScroll = true;
                }
            } else if (arrayProperty.of.dataType === "reference") {
                innerComponent = <TableReferenceField name={name as string}
                                                      disabled={disabled}
                                                      internalValue={internalValue as firebase.firestore.DocumentReference[]}
                                                      updateValue={updateValue}
                                                      size={size}
                                                      CMSFormField={CMSFormField}
                                                      CollectionTable={CollectionTable}
                                                      schema={schema}
                                                      property={property as ReferenceProperty}
                                                      setPreventOutsideClick={setPreventOutsideClick}
                />;
                allowScroll = false;
            }
        }
    }

    if (!innerComponent) {
        allowScroll = false;
        showExpandIcon = selected && !innerComponent && !disabled;
        innerComponent = (
            <ErrorBoundary>
                <PreviewComponent
                    width={width}
                    height={height}
                    name={name as string}
                    value={internalValue}
                    property={property}
                    size={getPreviewSizeFrom(size)}
                />
            </ErrorBoundary>
        );
    }

    let component: JSX.Element;
    if (!disabled) {
        component = (
            <OverflowingCell allowScroll={allowScroll}
                             size={size}
                             align={align}>
                {innerComponent}
            </OverflowingCell>
        );
    } else {
        component = (
            <DisabledTableCell tooltip={disabledTooltip}
                               size={size}
                               align={align}>
                {innerComponent}
            </DisabledTableCell>
        );
    }

    return (
        <div
            tabIndex={selected || disabled ? undefined : 0}
            key={`$table_cell_${tableKey}_${rowIndex}_${columnIndex}`}
            ref={ref}
            onFocus={onFocus}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
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
                <Tooltip
                    classes={{
                        arrow: tooltipClasses.arrow,
                        tooltip: tooltipClasses.tooltip
                    }}
                    arrow
                    placement={"left"}
                    title={error.message}>
                    <ErrorOutlineIcon
                        fontSize={"inherit"}
                        color={"error"}
                    />
                </Tooltip>
            </div>
            }

            {component}

            {showExpandIcon && (
                <IconButton
                    ref={iconRef}
                    className={classes.expandIcon}
                    color={"primary"}
                    size={"small"}
                    onClick={openPopup}>
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
};

export default React.memo<TableCellProps<any, any, any> & CellStyleProps>(TableCell) as React.FunctionComponent<TableCellProps<any, any, any> & CellStyleProps>;


