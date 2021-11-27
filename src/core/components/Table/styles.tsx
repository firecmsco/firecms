import React from "react";
import { alpha, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { TableSize } from "./TableProps";
import { css } from "@emotion/react";

export const baseTableCss = css`
  & .BaseTable {
    box-shadow: 0 2px 4px 0 rgba(128, 128, 128, 0.2);
    contain: strict;
    position: relative;
    box-sizing: border-box;
    font-size: 13px;
  }

  & .BaseTable--disabled {
    opacity: 0.7;
    pointer-events: none;
  }

  & .BaseTable--dynamic .BaseTable__row {
    overflow: hidden;
    align-items: stretch;
  }

  & .BaseTable:not(.BaseTable--dynamic) .BaseTable__row-cell-text,
  & .BaseTable .BaseTable__row--frozen .BaseTable__row-cell-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .BaseTable__table {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column-reverse;
  }

  & .BaseTable__table-main {
    outline: 1px solid rgba(128, 128, 128, 0.1);
    left: 0;
  }

  & .BaseTable__table-main .BaseTable__header-cell:first-child, .BaseTable__table-main .BaseTable__row-cell:first-child {
    padding: 0;
  }

  & .BaseTable__table-frozen-left .BaseTable__body {
    backdrop-filter: blur(4px);
  }

  & .BaseTable__table-frozen-left .BaseTable__header,
  & .BaseTable__table-frozen-left .BaseTable__body, .BaseTable__table-frozen-right .BaseTable__header,
  & .BaseTable__table-frozen-right .BaseTable__body {
    overflow: hidden !important;
  }

  & .BaseTable__table-frozen-left {
    box-shadow: 2px 0 4px 0 rgba(128, 128, 128, 0.1);
    top: 0;
    left: 0;
  }

  & .BaseTable__table-frozen-left .BaseTable__header-cell:first-child, .BaseTable__table-frozen-left .BaseTable__row-cell:first-child {
    padding: 0;
  }

  & .BaseTable__table-frozen-left .BaseTable__header-row,
  & .BaseTable__table-frozen-left .BaseTable__row {
    padding-right: 0 !important;
  }

  & .BaseTable__table-frozen-left .BaseTable__body {
    overflow-y: auto !important;
  }

  & .BaseTable__table-frozen-right {
    box-shadow: -2px 0 4px 0 rgba(128, 128, 128, 0.3);
    top: 0;
    right: 0;
  }

  & .BaseTable__table-frozen-right .BaseTable__header-cell:last-child, .BaseTable__table-frozen-right .BaseTable__row-cell:last-child {
    padding-right: 15px;
  }

  & .BaseTable__table-frozen-right .BaseTable__header-row,
  & .BaseTable__table-frozen-right .BaseTable__row {
    padding-left: 0 !important;
  }

  & .BaseTable__table-frozen-right .BaseTable__body {
    overflow-y: auto !important;
  }

  & .BaseTable__header {
    overflow: hidden !important;
  }

  & .BaseTable .BaseTable__header,
  & .BaseTable .BaseTable__body {
    outline: none;
  }

  & .BaseTable__header-row, .BaseTable__row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);
    box-sizing: border-box;
  }

  & .BaseTable__header-row {
    /*background-color: #f8f8f8;*/
    font-weight: 700;
  }

  & .BaseTable__row {
    /*background-color: #ffffff;*/
  }

  & .BaseTable__row:hover, .BaseTable__row--hovered {
    /*background-color: rgba(128, 128, 128, 0.02);*/
  }

  & .BaseTable__row-expanded {
    /*border-bottom: 1px solid #eeeeee;*/
  }

  & .BaseTable__header-cell, .BaseTable__row-cell {
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 7.5px;
    box-sizing: border-box;
  }

  & .BaseTable__header-cell--align-center, .BaseTable__row-cell--align-center {
    justify-content: center;
    text-align: center;
  }

  & .BaseTable__header-cell--align-right, .BaseTable__row-cell--align-right {
    justify-content: flex-end;
    text-align: right;
  }

  & .BaseTable__header-cell {
    position: relative;
    cursor: default;
  }

  & .BaseTable__header-cell:hover .BaseTable__column-resizer {
    visibility: visible;
    opacity: 0.5;
  }

  & .BaseTable__header-cell:hover .BaseTable__column-resizer:hover {
    opacity: 1;
  }

  & .BaseTable__header-cell .BaseTable__sort-indicator {
    display: none;
  }

  & .BaseTable__header-cell--sortable:hover {
    background-color: #f3f3f3;
    cursor: pointer;
  }

  & .BaseTable__header-cell--sortable:not(.BaseTable__header-cell--sorting):hover .BaseTable__sort-indicator {
    display: block;
    color: #888888;
  }

  & .BaseTable__header-cell--sorting .BaseTable__sort-indicator, .BaseTable__header-cell--sorting:hover .BaseTable__sort-indicator {
    display: block;
  }

  & .BaseTable__header-cell--resizing .BaseTable__column-resizer {
    visibility: visible;
    opacity: 1;
  }

  & .BaseTable__header-cell--resizing .BaseTable__column-resizer::after {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    content: '';
    left: -9999px;
  }

  & .BaseTable__header-cell-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }

  & .BaseTable__header-row--resizing .BaseTable__header-cell {
    background-color: transparent;
    cursor: col-resize;
  }

  & .BaseTable__header-row--resizing .BaseTable__header-cell:not(.BaseTable__header-cell--sorting) .BaseTable__sort-indicator {
    display: none;
  }

  & .BaseTable__header-row--resizing .BaseTable__header-cell:not(.BaseTable__header-cell--resizing) .BaseTable__column-resizer {
    visibility: hidden;
  }

  & .BaseTable__column-resizer {
    width: 3px;
    visibility: hidden;
    background-color: #cccccc;
  }

  & .BaseTable__column-resizer:hover {
    visibility: visible;
    opacity: 1;
  }

  & .BaseTable__footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background-color: #ffffff;
  }

  & .BaseTable__resizing-line {
    cursor: col-resize;
    position: absolute;
    top: 0;
    background-color: #cccccc;
    width: 3px;
    transform: translateX(-100%);
  }

  & .BaseTable__empty-layer {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
  }

  & .BaseTable__overlay {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
  }

  & .BaseTable__overlay > * {
    pointer-events: auto;
  }
`;


export const useTableStyles = makeStyles<Theme>(theme => createStyles({
    tableContainer: {
        width: "100%",
        height: "100%",
        flexGrow: 1,
    },
    headerTypography: {
        fontSize: "0.750rem",
        fontWeight: 600,
        textTransform: "uppercase"
    },
    header: {
        width: "calc(100% + 24px)",
        margin: "0px -12px",
        padding: "0px 12px",
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.default,
        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        height: "100%",
        fontSize: "0.750rem",
        textTransform: "uppercase",
        fontWeight: 600
    },
    tableRow: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        fontSize: "0.875rem"
    },
    tableRowClickable: {
        "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, .6) : alpha(theme.palette.background.default, .5)
        }
    },
    column: {
        padding: "0px !important"
    },
    cellButtonsWrap: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, .8) : alpha(theme.palette.background.default, .8)
    },
    cellButtons: {
        minWidth: 138
    },
    cellButtonsId: {
        width: 138,
        textAlign: "center",
        textOverflow: "ellipsis",
        overflow: "hidden"
    }
}));

export interface CellStyleProps {
    size: TableSize;
    align: "right" | "left" | "center";
}

export const useCellStyles = makeStyles<Theme, CellStyleProps & { disabled: boolean }>(theme => createStyles({
        tableCell: {
            position: "relative",
            height: "100%",
            width: "100%",
            border: "2px solid transparent",
            borderRadius: 4,
            overflow: "hidden",
            contain: "strict",
            display: "flex",
            padding: ({ size }) => {
                switch (size) {
                    case "l":
                    case "xl":
                        return theme.spacing(2);
                    case "m":
                        return theme.spacing(1);
                    case "s":
                        return theme.spacing(0.5);
                    default:
                        return theme.spacing(0.25);
                }
            },
            "&:hover": {
                backgroundColor: ({ disabled }: any) => disabled ? undefined : (theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.background.default)
            },
            justifyContent: ({ align }) => {
                switch (align) {
                    case "right":
                        return "flex-end";
                    case "center":
                        return "center";
                    case "left":
                    default:
                        return "flex-start";
                }
            }
        },
        fullWidth: {
            width: "100%"
        },
        error: {
            border: `2px solid ${theme.palette.error.light} !important`
        },
        selected: {
            backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.background.default,
            border: "2px solid #5E9ED6",
            transition: "border-color 300ms ease-in-out"
        },
        saved: {
            border: `2px solid ${theme.palette.success.light}`
        },
        disabled: {
            alpha: 0.8
        },
        iconsTop: {
            position: "absolute",
            top: 2,
            right: 2
        },
        arrow: {
            color: theme.palette.error.light
        },
        tooltip: {
            margin: "0 8px",
            backgroundColor: theme.palette.error.light
        },
        centered: {
            alignItems: "center"
        },
        faded: {
            "-webkit-mask-image": "linear-gradient(to bottom, black 60%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            alignItems: "start"
        },
        scrollable: {
            overflow: "auto",
            alignItems: "start"
        }
    })
);

