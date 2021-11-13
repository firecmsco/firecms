import React, { useCallback, useEffect, useMemo, useState } from "react";
import Measure, { ContentRect } from "react-measure";
import { IconButton, Tooltip } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import clsx from "clsx";
import { CellStyleProps, useCellStyles } from "./styles";
import { getRowHeight } from "./common";


interface TableCellProps<T, M> {
    children: React.ReactNode;
    disabled: boolean;
    saved?: boolean;
    error?: Error;
    allowScroll?: boolean;
    disabledTooltip?: string;
    focused?: boolean;
    selected?: boolean;
    showExpandIcon?: boolean;
    select?: (cellRect: DOMRect | undefined) => void;
    openPopup?: (cellRect: DOMRect | undefined) => void;
}

const TableCellInternal = <T, M>({
                                     children,
                                     selected,
                                     focused,
                                     disabled,
                                     disabledTooltip,
                                     size,
                                     saved,
                                     error,
                                     align,
                                     allowScroll,
                                     openPopup,
                                     select,
                                     showExpandIcon = true
                                 }: TableCellProps<T, M> & CellStyleProps) => {

    const ref = React.createRef<HTMLDivElement>();

    const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
    const maxHeight = useMemo(() => getRowHeight(size), [size]);

    const [onHover, setOnHover] = useState(false);
    const [internalSaved, setInternalSaved] = useState(saved);

    const iconRef = React.createRef<HTMLButtonElement>();
    useEffect(() => {
        if (iconRef.current && focused) {
            iconRef.current.focus({ preventScroll: true });
        }
    }, [focused]);

    useEffect(() => {
        if (internalSaved != saved) {
            if (saved) {
                setInternalSaved(true);
            } else {
                setInternalSaved(true);
            }
        }
        const removeSavedState = () => {
            setInternalSaved(false);
        };
        const handler = setTimeout(removeSavedState, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [saved]);

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.detail == 3) {
            doOpenPopup();
        }
    };

    function doOpenPopup() {
        if (openPopup) {
            const cellRect = ref && ref?.current?.getBoundingClientRect();
            openPopup(cellRect);
        }
    }

    const onIconClick = (event: any) => {
        doOpenPopup();
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
        if (contentRect?.bounds) {
            const newOverflowingValue = contentRect.bounds.height > maxHeight;
            if (isOverflowing !== newOverflowingValue)
                setIsOverflowing(newOverflowingValue);
        }
    }, [maxHeight]);


    const cellClasses = useCellStyles({
        size,
        align,
        disabled: disabled
    });

    const measuredDiv = <Measure
        bounds
        onResize={onMeasure}
    >
        {({ measureRef }) => (
            <div ref={measureRef}
                 className={clsx(cellClasses.fullWidth)}>
                {children}
            </div>
        )}
    </Measure>;
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
                    [cellClasses.disabled]: disabled,
                    [cellClasses.centered]: disabled || !isOverflowing,
                    [cellClasses.error]: error,
                    [cellClasses.saved]: selected && internalSaved,
                    [cellClasses.selected]: !error && selected || focused
                })}>

            <div className={clsx(cellClasses.fullWidth, {
                [cellClasses.faded]: !disabled && !allowScroll && isOverflowing,
                [cellClasses.scrollable]: !disabled && allowScroll && isOverflowing
            })}>
                {measuredDiv}
            </div>

            {disabled && onHover && disabledTooltip &&
            <div style={{
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: "14px"
            }}>
                <Tooltip title={disabledTooltip}>
                    <RemoveCircleIcon color={"disabled"}
                                      fontSize={"inherit"}/>
                </Tooltip>
            </div>}

            {(error || showExpandIcon) &&
            <div className={cellClasses.iconsTop}>

                {selected && !disabled && showExpandIcon &&
                <IconButton
                    ref={iconRef}
                    color={"inherit"}
                    size={"small"}
                    onClick={onIconClick}>
                    <svg
                        className={"MuiSvgIcon-root MuiSvgIcon-fontSizeSmall"}
                        fill={"#666"}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24">
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

export const TableCell = React.memo<TableCellProps<any, any> & CellStyleProps>(TableCellInternal) as React.FunctionComponent<TableCellProps<any, any> & CellStyleProps>;



