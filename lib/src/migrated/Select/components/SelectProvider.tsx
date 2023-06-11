import React, { createContext, useContext, useMemo } from "react";

import { ClassNames, GroupOption, Option } from "./type";

interface Store {
    value: Option | Option[] | null;
    handleValueChange: (selected: Option) => void;
    formatGroupLabel: ((data: GroupOption) => JSX.Element) | null;
    formatOptionLabel: ((data: Option) => JSX.Element) | null;
    classNames?: ClassNames;
}

interface Props {
    value: Option | Option[] | null;
    handleValueChange: (selected: Option) => void;
    children: JSX.Element;
    otherData: {
        formatGroupLabel: ((data: GroupOption) => JSX.Element) | null;
        formatOptionLabel: ((data: Option) => JSX.Element) | null;
        classNames?: ClassNames;
    };
}

export const SelectContext = createContext<Store>({
    value: null,
    handleValueChange: selected => {
        console.log("selected:", selected);
    },
    formatGroupLabel: null,
    formatOptionLabel: null,
    classNames: undefined
});

export const useSelectContext = (): Store => {
    return useContext(SelectContext);
};

const SelectProvider: React.FC<Props> = ({ value, handleValueChange, otherData, children }) => {
    const store = useMemo(() => {
        return {
            value,
            handleValueChange,
            formatGroupLabel:
                otherData && typeof otherData.formatGroupLabel === "function"
                    ? otherData.formatGroupLabel
                    : null,
            formatOptionLabel:
                otherData && typeof otherData.formatOptionLabel === "function"
                    ? otherData.formatOptionLabel
                    : null,
            classNames: otherData?.classNames || undefined
        };
    }, [handleValueChange, otherData, value]);

    return <SelectContext.Provider value={store}>{children}</SelectContext.Provider>;
};

export default SelectProvider;
