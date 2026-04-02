import React, { useContext } from "react";
import { EntityCollectionTableController } from "../common/types";

export const SelectableTableContext = React.createContext<EntityCollectionTableController<Record<string, unknown>>>(null! as EntityCollectionTableController<Record<string, unknown>>);

export const useSelectableTableController = () => useContext<EntityCollectionTableController<any>>(SelectableTableContext);
