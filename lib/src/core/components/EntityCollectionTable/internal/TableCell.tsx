import React, { useCallback, useEffect, useMemo, useState } from "react";
import useMeasure from "react-use-measure";
import { styled } from "@mui/system";

import {
    Box,
    darken,
    IconButton,
    lighten,
    Tooltip,
    useTheme
} from "@mui/material";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { TableSize } from "../../Table";
import { getRowHeight } from "../../Table/common";
import { ErrorBoundary } from "../../ErrorBoundary";
import { ErrorTooltip } from "../../ErrorTooltip";

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
    focused: boolean;
    showExpandIcon?: boolean;
    removePadding?: boolean;
    fullHeight?: boolean;
    selected?: boolean;
    selectedRow: boolean;
    onSelect?: (cellRect: DOMRect | undefined) => void;
    openPopup?: (cellRect: DOMRect | undefined) => void;
}

function getBackgroundColor(onHover: any, selectedRow: boolean, disabled: boolean, saved: boolean, theme: any, isSelected: boolean) {
    if (onHover && !disabled) {
        if (theme.palette.mode === "dark") {
            return lighten(theme.palette.background.paper, 0.03);
        } else {
            return darken(theme.palette.background.default, 0.02);
        }
    }
    if (isSelected) {
        if (theme.palette.mode === "dark") {
            return lighten(theme.palette.background.paper, 0.035);
        } else {
            return darken(theme.palette.background.default, 0.025);
        }
    }
    if (selectedRow || saved) {
        if (theme.palette.mode === "dark") {
            return lighten(theme.palette.background.paper, 0.022);
        } else {
            return darken(theme.palette.background.default, 0.008);
        }
    }
    return undefined;
}

type TableCellRootProps = {
    padding: string;
    border: string;
    justifyContent: string;
    contain: string,
    alignItems?: string,
    backgroundColor?: string
}
const TableCellRoot = styled("div", {})<TableCellRootProps>(({
                                                                 theme,
                                                                 justifyContent,
                                                                 padding,
                                                                 border,
                                                                 alignItems,
                                                                 backgroundColor
                                                             }) => ({
    alignItems,
    backgroundColor,
    padding,
    border,
    justifyContent,
    display: "flex",
    position: "relative",
    height: "100%",
    borderRadius: "4px",
    overflow: "hidden",
    // contain: "content",
    contain: "content",
    transition: "border-color 200ms ease-in-out, background-color 500ms ease"
}));

type TableCellInnerProps = {
    justifyContent: string;
    scrollable: boolean;
    faded: boolean;
    fullHeight: boolean;

}
const TableCellInner = styled("div", {})<TableCellInnerProps>(({
                                                                   theme,
                                                                   justifyContent,
                                                                   scrollable,
                                                                   faded,
                                                                   fullHeight
                                                               }) => ({

    display: "flex",
    maxHeight: "100%",
    width: "100%",
    flexDirection: "column",
    height: fullHeight ? "100%" : undefined,
    justifyContent,
    overflow: scrollable ? "auto" : undefined,
    WebkitMaskImage: faded ? "linear-gradient(to bottom, black 60%, transparent 100%)" : undefined,
    maskImage: faded ? "linear-gradient(to bottom, black 60%, transparent 100%)" : undefined,
    alignItems: faded ? "start" : (scrollable ? "start" : undefined)

}));

export const TableCell = React.memo<TableCellProps>(
    function TableCell({
                           children,
                           focused,
                           size,
                           selected,
                           disabled,
                           disabledTooltip,
                           saved,
                           selectedRow,
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
        const theme = useTheme();
        const ref = React.createRef<HTMLDivElement>();

        const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
        const maxHeight = useMemo(() => getRowHeight(size), [size]);

        const [onHover, setOnHover] = useState(false);
        const [internalSaved, setInternalSaved] = useState(saved);

        const showError = !disabled && error;

        const iconRef = React.createRef<HTMLButtonElement>();
        useEffect(() => {
            if (iconRef.current && focused) {
                iconRef.current.focus({ preventScroll: true });
            }
        }, [focused]);

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

        let p = theme.spacing(0);
        if (!removePadding) {
            switch (size) {
                case "l":
                case "xl":
                    p = theme.spacing(2);
                    break;
                case "m":
                    p = theme.spacing(1);
                    break;
                case "s":
                    p = theme.spacing(0.5);
                    break;
                default:
                    p = theme.spacing(0.25);
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
        }, [ref]);

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

        let border: string;
        if (internalSaved) {
            border = `2px solid ${theme.palette.success.light}`;
        } else if (isSelected) {
            border = "2px solid #5E9ED6";
        } else if (showError) {
            border = `2px solid ${theme.palette.error.light} !important`
        } else {
            border = "2px solid transparent"
        }

        const scrollable = !disabled && allowScroll && isOverflowing;
        const faded = !disabled && !allowScroll && isOverflowing;

        const setOnHoverTrue = useCallback(() => setOnHover(true), []);
        const setOnHoverFalse = useCallback(() => setOnHover(false), []);

        return (
            <TableCellRoot
                style={{
                    width: width ?? "100%"
                }}
                tabIndex={selected || disabled ? undefined : 0}
                ref={ref}
                onFocus={onFocus}
                onClick={onClick}
                onMouseEnter={setOnHoverTrue}
                onMouseMove={setOnHoverTrue}
                onMouseLeave={setOnHoverFalse}
                padding={p}
                contain={scrollable ? "content" : "size"}
                border={border}
                justifyContent={justifyContent}
                alignItems={disabled || !isOverflowing ? "center" : undefined}
                backgroundColor={getBackgroundColor(onHover, selectedRow, disabled, internalSaved ?? false, theme, isSelected ?? false)}
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
                    <Box sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        fontSize: "14px"
                    }}>
                        <Tooltip title={disabledTooltip}>
                            <RemoveCircleIcon color={"disabled"}
                                              fontSize={"inherit"}/>
                        </Tooltip>
                    </Box>}

                {(showError || showExpandIcon) &&
                    <Box sx={{
                        position: "absolute",
                        top: "2px",
                        right: "2px"
                    }}>

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
                            arrow
                            placement={"left"}
                            title={showError.message}>
                            <ErrorOutlineIcon
                                fontSize={"inherit"}
                                color={"error"}
                            />
                        </ErrorTooltip>
                        }

                    </Box>
                }

            </TableCellRoot>
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
        a.focused === b.focused &&
        a.showExpandIcon === b.showExpandIcon &&
        a.removePadding === b.removePadding &&
        a.fullHeight === b.fullHeight &&
        a.selected === b.selected &&
        a.selectedRow === b.selectedRow) as React.FunctionComponent<TableCellProps>;
