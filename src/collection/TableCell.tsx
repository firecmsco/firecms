import {
    ArrayProperty,
    Entity,
    EntitySchema,
    EntityStatus,
    NumberProperty,
    Property,
    ReferenceProperty,
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
import { saveEntity } from "../models/firestore";
import clsx from "clsx";
import OverflowingCell from "./OverflowingCell";
import { TableInput } from "./fields/TableInput";
import { TableSelect } from "./fields/TableSelect";
import { NumberTableInput } from "./fields/TableNumberInput";
import { TableSwitch } from "./fields/TableSwitch";
import { TableDateField } from "./fields/TableDateField";
import ErrorBoundary from "../components/ErrorBoundary";
import { PreviewComponent } from "../preview";
import { CellStyleProps, useCellStyles } from "./styles";
import { TableReferenceField } from "./fields/TableReferenceField";
import { FormFieldBuilder } from "../form";
import { CollectionTableProps } from "./CollectionTableProps";

import firebase from "firebase/app";
import "firebase/firestore";
import { getPreviewSizeFrom } from "../preview/util";

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


interface TableCellProps<T, S extends EntitySchema<string>> {
    tableKey: string,
    columnIndex: number,
    rowIndex: number,
    name: string,
    path: string,
    selected: boolean,
    entity: Entity<S>,
    schema: S,
    value: T,
    select: (cellRect: DOMRect) => void,
    openPopup: () => void,
    setPreventOutsideClick: (value: boolean) => void,
    focused: boolean,
    setFocused: (value: boolean) => void,
    property: Property<T>,
    createFormField: FormFieldBuilder;
    CollectionTable: React.FunctionComponent<CollectionTableProps<S>>,
}


const TableCell = <T, S extends EntitySchema<string>>({
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
                                                          createFormField,
                                                          CollectionTable
                                                      }: TableCellProps<T, S> & CellStyleProps) => {

    const ref = React.createRef<HTMLDivElement>();
    const [internalValue, setInternalValue] = useState<any | null>(value);

    const [error, setError] = useState<Error | undefined>();

    const tooltipClasses = useStyles();
    const classes = useCellStyles({ size, align, disabled: false });

    const iconRef = React.createRef<HTMLButtonElement>();
    useEffect(() => {
        if (iconRef.current && focused) {
            iconRef.current.focus({ preventScroll: true });
        }
    }, [focused]);

    const onSelect = () => {
        const cellRect = ref && ref?.current?.getBoundingClientRect();
        if (!selected && cellRect) {
            select(cellRect);
        }
    };

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.detail > 1) event.preventDefault();
        onSelect();
    };

    const onDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        onSelect();
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

    const updateValue = useCallback(
        (newValue: any | null) => {

            let setValue;
            if (newValue === undefined) {
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
        },
        []
    );

    let component;
    let inputComponent;

    if (selected && property.dataType === "number") {
        const numberProperty = property as NumberProperty;
        if (numberProperty.config?.enumValues) {
            inputComponent = <TableSelect name={name as string}
                                          multiple={false}
                                          focused={focused}
                                          enumValues={numberProperty.config.enumValues}
                                          error={error}
                                          onBlur={onBlur}
                                          internalValue={internalValue as string | number}
                                          updateValue={updateValue}
                                          setPreventOutsideClick={setPreventOutsideClick}
            />;
        } else {
            inputComponent = <NumberTableInput
                align={align}
                error={error}
                focused={focused}
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
                                          setPreventOutsideClick={setPreventOutsideClick}
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
                                             setPreventOutsideClick={setPreventOutsideClick}
            />;
    } else if (property.dataType === "reference") {
        inputComponent = <TableReferenceField name={name as string}
                                              internalValue={internalValue as firebase.firestore.DocumentReference}
                                              updateValue={updateValue}
                                              size={size}
                                              createFormField={createFormField}
                                              CollectionTable={CollectionTable}
                                              schema={schema}
                                              property={property as ReferenceProperty}
                                              setPreventOutsideClick={setPreventOutsideClick}
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
                                              setPreventOutsideClick={setPreventOutsideClick}
                />;
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
            tabIndex={selected ? undefined : 0}
            key={`$table_cell_${tableKey}_${rowIndex}_${columnIndex}`}
            ref={ref}
            onFocus={onSelect}
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
            </div>}

            {component}

            {selected && !inputComponent && (
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

// const TableCellMemo = React.memo<TableCellProps<any, any> & StyleProps>(TableCell) as React.FunctionComponent<TableCellProps<any, any> & StyleProps>;
export default React.memo<TableCellProps<any, any> & CellStyleProps>(TableCell) as React.FunctionComponent<TableCellProps<any, any> & CellStyleProps>;


