import { useCallback, useState } from "react";
import { Entity, SelectionController } from "../../types";

export function useSelectionController<M extends Record<string, any> = any>(
    onSelectionChange?: (entity: Entity<M>, selected: boolean) => void
): SelectionController<M> {

    const [selectedEntities, setSelectedEntities] = useState<Entity<M>[]>([]);

    const toggleEntitySelection = useCallback((entity: Entity<M>, newSelectedState?: boolean) => {
        let newValue;
        if (newSelectedState === undefined) {
            const isSelected = Boolean(selectedEntities.find(e => e.id === entity.id && e.path === entity.path));
            if (isSelected) {
                onSelectionChange?.(entity, false);
                newValue = selectedEntities.filter((item: Entity<M>) => !(item.id === entity.id && item.path === entity.path));
            } else {
                onSelectionChange?.(entity, true);
                newValue = [...selectedEntities, entity];
            }
        } else {
            if (newSelectedState) {
                onSelectionChange?.(entity, true);
                newValue = [...selectedEntities, entity];
            } else {
                onSelectionChange?.(entity, false);
                newValue = selectedEntities.filter((item: Entity<M>) => !(item.id === entity.id && item.path === entity.path));
            }
        }
        setSelectedEntities(newValue);
    }, [selectedEntities]);

    const isEntitySelected = useCallback((entity: Entity<M>) => {
        return Boolean(selectedEntities.find(e => e.id === entity.id && e.path === entity.path));
    }, [selectedEntities]);

    return {
        selectedEntities,
        setSelectedEntities,
        isEntitySelected,
        toggleEntitySelection
    };
}
