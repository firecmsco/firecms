import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import useMeasure from "react-use-measure";

import { TableSize } from "../../Table";
import { getRowHeight } from "../../Table/common";
import { ErrorBoundary } from "../../ErrorBoundary";
import { ErrorTooltip } from "../../ErrorTooltip";
import { IconButton, Tooltip } from "../../../../components";
import { useOutsideAlerter } from "../../../internal/useOutsideAlerter";
import { ErrorOutlineIcon, RemoveCircleIcon } from "../../../../icons";

interface TableCellProps {
    children: React.ReactNode;
    /**
     * The value is used only to check changes and force re-renders
     */
    value?: any;
    disabled: boolean;
    saved?: boolean;
    error?: Error;
    allowScroll?: boolean;
    align: "right" | "left" | "center";
    size: TableSize;
    disabledTooltip?: string;
    width: number;
    showExpandIcon?: boolean;
    removePadding?: boolean;
    fullHeight?: boolean;
    selected?: boolean;
    onSelect?: (cellRect: DOMRect | undefined) => void;
    openPopup?: (cellRect: DOMRect | undefined) => void;
}

type TableCellInnerProps = {
    justifyContent: string;
    scrollable: boolean;
    faded: boolean;
    fullHeight: boolean;
    children: React.ReactNode;
}

const TableCellInner = ({
                            justifyContent,
                            scrollable,
                            faded,
                            fullHeight,
                            children
                        }: TableCellInnerProps) => {
    return (
        <div
            className={clsx("flex flex-col max-h-full w-full",
                {
                    "items-start": faded || scrollable
                })}
            style={{
                justifyContent,
                height: fullHeight ? "100%" : undefined,
                overflow: scrollable ? "auto" : undefined,
                WebkitMaskImage: faded
                    ? "linear-gradient(to bottom, black 60%, transparent 100%)"
                    : undefined,
                maskImage: faded
                    ? "linear-gradient(to bottom, black 60%, transparent 100%)"
                    : undefined
            }}
        >
            {children}
        </div>
    );
};

export const TableCell = React.memo<TableCellProps>(
    function TableCell({
                           children,
                           size,
                           selected,
                           disabled,
                           disabledTooltip,
                           saved,
                           error,
                           align,
                           allowScroll,
                           openPopup,
                           removePadding,
                           fullHeight,
                           onSelect,
                           width,
                           showExpandIcon = true
                       }: TableCellProps) {

        const [measureRef, bounds] = useMeasure();
        const ref = useRef<HTMLDivElement>(null);
        useOutsideAlerter(ref, () => {
            if (selected && onSelect) {
                onSelect(undefined);
            }
        }, Boolean(selected && onSelect));

        const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
        const maxHeight = useMemo(() => getRowHeight(size), [size]);

        const [onHover, setOnHover] = useState(false);
        const [internalSaved, setInternalSaved] = useState(saved);

        const showError = !disabled && error;

        const iconRef = useRef<HTMLButtonElement>();
        useEffect(() => {
            if (iconRef.current && selected) {
                iconRef.current.focus({ preventScroll: true });
            }
        }, [selected]);

        useEffect(() => {
            if (saved) {
                setInternalSaved(true);
            }
            const handler = setTimeout(() => {
                setInternalSaved(false);
            }, 800);
            return () => {
                clearTimeout(handler);
            };
        }, [saved]);

        let p = 0;
        if (!removePadding) {
            switch (size) {
                case "l":
                case "xl":
                    p = 4;
                    break;
                case "m":
                    p = 2;
                    break;
                case "s":
                default:
                    p = 1;
                    break;
            }
        }

        let justifyContent;
        switch (align) {
            case "right":
                justifyContent = "flex-end";
                break;
            case "center":
                justifyContent = "center";
                break;
            case "left":
            default:
                justifyContent = "flex-start";
        }

        const doOpenPopup = useCallback(() => {
            if (openPopup) {
                const cellRect = ref && ref?.current?.getBoundingClientRect();
                openPopup(cellRect);
            }
        }, []);

        const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            if (event.detail === 3) {
                doOpenPopup();
            }
        }, [doOpenPopup]);

        const onSelectCallback = useCallback(() => {
            if (!onSelect) return;
            const cellRect = ref && ref?.current?.getBoundingClientRect();
            if (disabled) {
                onSelect(undefined);
            } else if (!selected && cellRect) {
                onSelect(cellRect);
            }
        }, [ref, onSelect, selected, disabled]);

        const onFocus = useCallback((event: React.SyntheticEvent<HTMLDivElement>) => {
            onSelectCallback();
            event.stopPropagation();
        }, [onSelectCallback]);

        useEffect(() => {
            if (bounds) {
                const newOverflowingValue = bounds.height > maxHeight;
                if (isOverflowing !== newOverflowingValue)
                    setIsOverflowing(newOverflowingValue);
            }
        }, [bounds, isOverflowing, maxHeight]);

        const isSelected = !showError && selected;

        const scrollable = !disabled && allowScroll && isOverflowing;
        const faded = !disabled && !allowScroll && isOverflowing;

        const setOnHoverTrue = useCallback(() => setOnHover(true), []);
        const setOnHoverFalse = useCallback(() => setOnHover(false), []);

        return (
            <div
                ref={ref}
                className={clsx(
                    "transition-colors duration-100 ease-in-out",
                    `flex relative h-full rounded-md overflow-hidden p-${p} border border-4  border-opacity-75`,
                    onHover && !disabled ? "bg-gray-50 dark:bg-gray-900" : "",
                    saved ? "bg-gray-100 bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75" : "",
                    !isSelected && !internalSaved && !showError ? "border-transparent" : "",
                    isSelected ? "bg-gray-50 dark:bg-gray-900" : "",
                    isSelected && !internalSaved ? "border-primary" : "",
                    internalSaved ? "border-green-500 " : "",
                    showError ? "border-red-500" : ""
                )}
                style={{
                    justifyContent,
                    alignItems: disabled || !isOverflowing ? "center" : undefined,
                    width: width ?? "100%",
                    textAlign: align
                }}
                tabIndex={selected || disabled ? undefined : 0}
                onFocus={onFocus}
                onClick={onClick}
                onMouseEnter={setOnHoverTrue}
                onMouseMove={setOnHoverTrue}
                onMouseLeave={setOnHoverFalse}
                // contain={scrollable ? "content" : "size"}
            >

                <ErrorBoundary>

                    {fullHeight && !faded && children}

                    {(!fullHeight || faded) && <TableCellInner
                        fullHeight={fullHeight ?? false}
                        justifyContent={justifyContent}
                        scrollable={scrollable ?? false}
                        faded={faded}>

                        {!fullHeight && <div ref={measureRef}
                                             style={{
                                                 display: "flex",
                                                 width: "100%",
                                                 justifyContent,
                                                 height: fullHeight ? "100%" : undefined
                                             }}>
                            {children}
                        </div>}

                    </TableCellInner>}
                </ErrorBoundary>

                {disabled && onHover && disabledTooltip &&
                    <div className="absolute top-1 right-1 text-xs">
                        <Tooltip title={disabledTooltip}>
                            <RemoveCircleIcon color={"disabled"}/>
                        </Tooltip>
                    </div>}

                {(showError || (!disabled && showExpandIcon)) &&
                    <div className="absolute top-0.5 right-0.5">

                        {selected && !disabled && showExpandIcon &&
                            <IconButton
                                ref={iconRef}
                                color={"inherit"}
                                size={"small"}
                                onClick={doOpenPopup}>
                                <svg
                                    className={"MuiSvgIcon-root MuiSvgIcon-fontSizeSmall"}
                                    fill={"#888"}
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

                        {showError && <ErrorTooltip
                            placement={"left"}
                            title={showError.message}>
                            <ErrorOutlineIcon
                                size={"small"}
                                color={"error"}
                            />
                        </ErrorTooltip>
                        }

                    </div>
                }

            </div>
        );
    }, (a, b) =>
        a.error === b.error &&
        a.value === b.value &&
        a.disabled === b.disabled &&
        a.saved === b.saved &&
        a.allowScroll === b.allowScroll &&
        a.align === b.align &&
        a.size === b.size &&
        a.disabledTooltip === b.disabledTooltip &&
        a.width === b.width &&
        a.showExpandIcon === b.showExpandIcon &&
        a.removePadding === b.removePadding &&
        a.fullHeight === b.fullHeight &&
        a.selected === b.selected) as React.FunctionComponent<TableCellProps>;
