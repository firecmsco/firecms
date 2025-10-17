import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useMeasure from "react-use-measure";

import { cls, DoNotDisturbOnIcon, Tooltip } from "@firecms/ui";
import { ErrorBoundary } from "../../../components";
import { getRowHeight, TableSize } from "../../common/table_height";
import { ErrorTooltip } from "../../ErrorTooltip";

interface EntityTableCellProps {
    children: React.ReactNode;
    actions?: React.ReactNode;
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
    hideOverflow?: boolean;
    onSelect?: (cellRect: DOMRect | undefined) => void;
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
        <div className={cls("flex flex-col max-h-full w-full",
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

export const EntityTableCell = React.memo<EntityTableCellProps>(
    function EntityTableCell({
                                 children,
                                 actions,
                                 size,
                                 selected,
                                 disabled,
                                 disabledTooltip,
                                 saved,
                                 error,
                                 align,
                                 allowScroll,
                                 removePadding,
                                 fullHeight,
                                 onSelect,
                                 width,
                                 hideOverflow = true,
                                 showExpandIcon = true
                             }: EntityTableCellProps) {

        const [measureRef, bounds] = useMeasure();
        const ref = useRef<HTMLDivElement>(null);

        const maxHeight = useMemo(() => getRowHeight(size), [size]);

        const [onHover, setOnHover] = useState(false);
        const [internalSaved, setInternalSaved] = useState(saved);

        const showError = !disabled && Boolean(error);

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

        // const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        //     if (event.detail === 3) {
        //         doOpenPopup();
        //     }
        // }, [doOpenPopup]);

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
            event.stopPropagation();
            event.preventDefault();
            onSelectCallback();
        }, [onSelectCallback]);

        const isOverflowing = useMemo(() => {
            if (bounds) {
                return bounds.height > maxHeight;
            }
            return false;
        }, [bounds, maxHeight]);

        const isSelected = !showError && selected;

        const scrollable = !disabled && allowScroll && isOverflowing;
        const faded = !disabled && !allowScroll && isOverflowing;

        const setOnHoverTrue = useCallback(() => setOnHover(true), []);
        const setOnHoverFalse = useCallback(() => setOnHover(false), []);

        const borderClass = showError
            ? "border-red-500"
            : internalSaved
                ? "border-green-500"
                : isSelected
                    ? "border-primary"
                    : "border-transparent";

        const result = <>
            <div
                className={cls(
                    "transition-colors duration-100 ease-in-out",
                    `flex relative h-full rounded-md p-${p} border border-4  border-opacity-75`,
                    onHover && !disabled ? "bg-surface-50 dark:bg-surface-900" : "",
                    saved ? "bg-surface-100/75 dark:bg-surface-800/75" : "",
                    hideOverflow ? "overflow-hidden" : "",
                    isSelected ? "bg-surface-50 dark:bg-surface-900" : "",
                    borderClass
                )}
                ref={ref}
                style={{
                    justifyContent,
                    alignItems: disabled || !isOverflowing ? "center" : undefined,
                    width: width ?? "100%",
                    textAlign: align
                }}
                tabIndex={selected || disabled ? undefined : 0}
                onFocus={onFocus}
                onMouseEnter={setOnHoverTrue}
                onMouseMove={setOnHoverTrue}
                onMouseLeave={setOnHoverFalse}
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

                {actions}

                {disabled && onHover && disabledTooltip &&
                    <div className="absolute top-1 right-1 text-xs">
                        <Tooltip title={disabledTooltip}>
                            <DoNotDisturbOnIcon size={"smallest"} color={"disabled"} className={"text-text-disabled"}/>
                        </Tooltip>
                    </div>}

            </div>
        </>;
        if (showError) {
            return (
                <ErrorTooltip
                    align={"start"}
                    title={error?.message ?? "Error"}>
                    {result}
                </ErrorTooltip>
            );
        }
        return result;
    }, (a, b) => {
        return a.error === b.error &&
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
            a.selected === b.selected;
    }) as React.FunctionComponent<EntityTableCellProps>;
