import React, { useCallback, useEffect, useMemo, useState } from "react";
import Measure, { ContentRect } from "react-measure";
import { IconButton, Tooltip } from "@material-ui/core";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import clsx from "clsx";
import { CellStyleProps, useCellStyles } from "./styles";
import { EntitySchema } from "../models";
import { getRowHeight } from "./common";


interface TableCellProps<T, S extends EntitySchema<Key>, Key extends string> {
    children: React.ReactNode;
    disabled: boolean;
    error?: Error;
    allowScroll?: boolean;
    openPopup?: () => void;
    disabledTooltip?: string;
    focused?: boolean;
    selected?: boolean;
    showExpandIcon?: boolean;
    select?: (cellRect: DOMRect | undefined) => void,
}

const TableCell = <T, S extends EntitySchema<Key>, Key extends string>({
                                                                           children,
                                                                           selected,
                                                                           focused,
                                                                           disabled,
                                                                           disabledTooltip,
                                                                           size,
                                                                           error,
                                                                           align,
                                                                           allowScroll,
                                                                           openPopup,
                                                                           select,
                                                                           showExpandIcon = true
                                                                       }: TableCellProps<T, S, Key> & CellStyleProps) => {

    const ref = React.createRef<HTMLDivElement>();

    const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
    const maxHeight = useMemo(() => getRowHeight(size), [size]);

    const [onHover, setOnHover] = useState(false);

    const iconRef = React.createRef<HTMLButtonElement>();
    useEffect(() => {
        if (iconRef.current && focused) {
            iconRef.current.focus({ preventScroll: true });
        }
    }, [focused]);

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.detail == 3 && openPopup)
            openPopup();
    };

    const onFocus = (event: React.SyntheticEvent<HTMLDivElement>) => {
        onSelect();
        event.stopPropagation();
    };

    const onSelect = () => {
        if (!select) return;
        const cellRect = ref && ref?.current?.getBoundingClientRect();

        if (disabled) {
            select(undefined);
        } else if (!selected && cellRect) {
            select(cellRect);
        }
    };

    const onMeasure = useCallback((contentRect: ContentRect) => {
        if (contentRect?.bounds)
            setIsOverflowing(contentRect.bounds.height > maxHeight);
    }, [maxHeight]);


    const cellClasses = useCellStyles({
        size,
        align,
        disabled: disabled
    });

    return (
        <div
            tabIndex={selected || disabled ? undefined : 0}
            ref={ref}
            onFocus={onFocus}
            onClick={onClick}
            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}
            className={clsx(
                cellClasses.tableCell,
                {
                    [cellClasses.centered]: disabled || !isOverflowing,
                    [cellClasses.faded]: !disabled && !allowScroll && isOverflowing,
                    [cellClasses.scrollable]: !disabled && allowScroll && isOverflowing
                },
                {
                    [cellClasses.disabled]: disabled,
                    [cellClasses.error]: error,
                    [cellClasses.selected]: !error && selected || focused
                })}>

            <Measure
                bounds
                onResize={onMeasure}
            >
                {({ measureRef }) => (
                    <div ref={measureRef} style={{ width: "100%" }}>
                        {children}
                    </div>
                )}
            </Measure>

            {disabled && onHover && disabledTooltip &&
            <div style={{
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: "14px"
            }}>
                <Tooltip title={disabledTooltip}>
                    <RemoveCircleIcon color={"disabled"} fontSize={"inherit"}/>
                </Tooltip>
            </div>}

            {(error || showExpandIcon) && <div className={cellClasses.iconsTop}>

                {selected && !disabled && showExpandIcon &&
                <IconButton
                    ref={iconRef}
                    color={"default"}
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
                }

                {error && <Tooltip
                    classes={{
                        arrow: cellClasses.arrow,
                        tooltip: cellClasses.tooltip
                    }}
                    arrow
                    placement={"left"}
                    title={error.message}>
                    <ErrorOutlineIcon
                        fontSize={"inherit"}
                        color={"error"}
                    />
                </Tooltip>
                }


            </div>
            }

        </div>
    );
};

export default React.memo<TableCellProps<any, any, any> & CellStyleProps>(TableCell) as React.FunctionComponent<TableCellProps<any, any, any> & CellStyleProps>;


