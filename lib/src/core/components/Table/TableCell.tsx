import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";

import Measure, { ContentRect } from "react-measure";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { CellStyleProps } from "./styles";
import { getRowHeight } from "./common";
import isEqual from "react-fast-compare";
import { ErrorTooltip } from "../ErrorTooltip";
import { ErrorBoundary } from "../../internal/ErrorBoundary";

interface TableCellProps {
    children: React.ReactNode;
    /**
     * The value is used only to check changes and force rerenders
     */
    value?: any;
    disabled: boolean;
    saved?: boolean;
    error?: Error;
    allowScroll?: boolean;
    disabledTooltip?: string;
    focused?: boolean;
    showExpandIcon?: boolean;
    removePadding?: boolean;
    fullHeight?: boolean;
    selected?: boolean;
    onSelect?: (cellRect: DOMRect | undefined) => void;
    openPopup?: (cellRect: DOMRect | undefined) => void;
}

const TableCellInternal = ({
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
                               removePadding,
                               fullHeight,
                               onSelect,
                               showExpandIcon = true
                           }: TableCellProps & CellStyleProps) => {

    const theme = useTheme();
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
        if (internalSaved !== saved) {
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

    const onMeasure = useCallback((contentRect: ContentRect) => {
        if (contentRect?.bounds) {
            const newOverflowingValue = contentRect.bounds.height > maxHeight;
            if (isOverflowing !== newOverflowingValue)
                setIsOverflowing(newOverflowingValue);
        }
    }, [isOverflowing, maxHeight]);

    const measuredDiv = <Measure
        bounds
        onResize={onMeasure}
    >
        {({ measureRef }) => (
            <Box ref={measureRef}
                 sx={{
                     width: "100%",
                     height: fullHeight ? "100%" : undefined
                 }}>
                {children}
            </Box>
        )}
    </Measure>;

    const isSelected = !error && (selected || focused);

    let border: string;
    if (isSelected) {
        if (internalSaved) {
            border = `2px solid ${theme.palette.success.light}`;
        } else {
            border = "2px solid #5E9ED6";
        }
    } else if (error) {
        border = `2px solid ${theme.palette.error.light} !important`
    } else {
        border = "2px solid transparent"
    }

    const scrollable = !disabled && allowScroll && isOverflowing;
    const faded = !disabled && !allowScroll && isOverflowing;
    return (
        <ErrorBoundary>
            <Box
                tabIndex={selected || disabled ? undefined : 0}
                ref={ref}
                onFocus={onFocus}
                onClick={onClick}
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}
                sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "4px",
                    overflow: "hidden",
                    contain: "strict",
                    display: "flex",
                    alignItems: disabled || !isOverflowing ? "center" : undefined,
                    padding: p,
                    "&:hover": {
                        backgroundColor: disabled ? undefined : (theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.background.default)
                    },
                    justifyContent: justifyContent,

                    border: border,
                    alpha: disabled ? 0.8 : undefined,

                    backgroundColor: isSelected ? theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.background.default : undefined,
                    transition: "border-color 300ms ease-in-out"
                }}>

                <Box
                    sx={{
                        width: "100%",
                        height: fullHeight ? "100%" : undefined,
                        overflow: scrollable ? "auto" : undefined,
                        WebkitMaskImage: faded ? "linear-gradient(to bottom, black 60%, transparent 100%)" : undefined,
                        maskImage: faded ? "linear-gradient(to bottom, black 60%, transparent 100%)" : undefined,
                        alignItems: faded ? "start" : (scrollable ? "start" : undefined)
                    }}>
                    {measuredDiv}
                </Box>

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

                        {error && <ErrorTooltip
                            arrow
                            placement={"left"}
                            title={error.message}>
                            <ErrorOutlineIcon
                                fontSize={"inherit"}
                                color={"error"}
                            />
                        </ErrorTooltip>
                        }

                    </Box>
                }

            </Box>
        </ErrorBoundary>
    );
};

export const TableCell = React.memo<TableCellProps & CellStyleProps>(TableCellInternal, areEqual) as React.FunctionComponent<TableCellProps & CellStyleProps>;

function areEqual(prevProps: TableCellProps & CellStyleProps, nextProps: TableCellProps & CellStyleProps) {
    return prevProps.selected === nextProps.selected &&
        prevProps.focused === nextProps.focused &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.size === nextProps.size &&
        prevProps.align === nextProps.align &&
        prevProps.saved === nextProps.saved &&
        prevProps.showExpandIcon === nextProps.showExpandIcon &&
        prevProps.removePadding === nextProps.removePadding &&
        prevProps.fullHeight === nextProps.fullHeight &&
        isEqual(prevProps.value, nextProps.value)
        ;
}
