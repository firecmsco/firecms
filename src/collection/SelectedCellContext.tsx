import React, { useContext } from "react";
import { FormFieldProps } from "../form/form_props";
import { Entity } from "../models";

type CellKey =
    {
        tableKey: string,
        columnIndex: number,
        rowIndex: number,
        cellRect: DOMRect;
        width: number,
        height: number,
        fieldProps: FormFieldProps,
        entity: Entity<any>
    }
    | undefined;

const DEFAULT_SELECTED_CELL = {
    focused: false,
    popupOpen: false,
    select: (props: CellKey) => {
    },
    focus: (value: boolean) => {
    },
    unselect: (tableKey: string) => {
    },
    setPopup: (value: PopupProps) => {
    },
    closePopup: () => {
    },
    setPreventOutsideClick: (value: any) => {
    },
    preventOutsideClick: false,
    popup: { open: false }
};

export type SelectedCell = {
    width?: number;
    height?: number;
    tableKey?: string;
    columnIndex?: number;
    rowIndex?: number;
    focused: boolean;
    cellRect?: DOMRect;
    fieldProps?: FormFieldProps;
    entity?: Entity<any>;
    select: (props: CellKey) => void;
    focus: (value: boolean) => void;
    unselect: (tableKey: string) => void;
    setPopup: (props: PopupProps) => void,
    closePopup: () => void,
    popup: PopupProps,
    setPreventOutsideClick: (value: any) => void;
    preventOutsideClick: any;
};


export type PopupProps = {
    open: boolean,
    // cellRect?: DOMRect;
    // selector?: RefObject<HTMLDivElement>;
}


export const SelectedCellContext = React.createContext<SelectedCell>(DEFAULT_SELECTED_CELL);
export const useSelectedCellContext = () => useContext(SelectedCellContext);

interface CollectionTableProviderProps {
    children: React.ReactNode;
}

export const TableSelectedCellProvider: React.FC<CollectionTableProviderProps> = ({ children }) => {

    const [selectedCell, setSelectedCell] = React.useState<CellKey>(undefined);
    const [focused, setFocused] = React.useState<boolean>(false);

    const [popup, setPopupProps] = React.useState<PopupProps>({ open: false });
    const [preventOutsideClick, setPreventOutsideClick] = React.useState<boolean>(false);

    const select = (cell: CellKey) => {
        setSelectedCell(cell);
        setFocused(true);
        setPopupProps({ open: false });
    };

    const unselect = (tableKey: string) => {
        if (tableKey === selectedCell?.tableKey) {
            setSelectedCell(undefined);
            setFocused(false);
        }
        setPopupProps({ open: false });
        setPreventOutsideClick(false);
    };

    const focus = (value: boolean) => {
        setFocused(value);
    };

    const setPopup = (props: PopupProps) => {
        setPopupProps(props);
    };

    const closePopup = () => {
        setPopupProps({
            ...popup,
            open: false
        });
    };

    return (
        <SelectedCellContext.Provider
            value={{
                tableKey: selectedCell?.tableKey,
                columnIndex: selectedCell?.columnIndex,
                rowIndex: selectedCell?.rowIndex,
                entity: selectedCell?.entity,
                fieldProps: selectedCell?.fieldProps,
                cellRect: selectedCell?.cellRect,
                focused,
                select,
                unselect,
                focus,
                popup,
                setPopup,
                closePopup,
                preventOutsideClick,
                setPreventOutsideClick
            }}
        >

            {children}

        </SelectedCellContext.Provider>
    );
};



