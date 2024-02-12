import React, { useContext } from "react";
import { EntityCollectionTableController } from "../common/types";

export const SelectableTableContext = React.createContext<EntityCollectionTableController<any>>({} as any);

export const useSelectableTableController = () => useContext<EntityCollectionTableController<any>>(SelectableTableContext);
