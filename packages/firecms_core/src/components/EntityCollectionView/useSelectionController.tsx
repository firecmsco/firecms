import { useCallback, useState } from "react";
import { Entity, SelectionController } from "../../types";

export function useSelectionController<M extends Record<string, any> = any>(
    onSelectionChange?: (entity: Entity<M>, selected: boolean) => void
): SelectionController<M> {

    const [selectedEntities, setSelectedEntities] = useState<Entity<M>[]>([]);

    const toggleEntitySelection = useCallback((entity: Entity<M>, newSelectedState?: boolean) => {
        let newValue;
        if (newSelectedState === undefined) {
            if (selectedEntities.map(e => e.id).includes(entity.id)) {
                onSelectionChange?.(entity, false);
                newValue = selectedEntities.filter((item: Entity<M>) => item.id !== entity.id);
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
                newValue = selectedEntities.filter((item: Entity<M>) => item.id !== entity.id);
            }
        }
        setSelectedEntities(newValue);
    }, [selectedEntities]);

    const isEntitySelected = useCallback((entity: Entity<M>) => {
        return selectedEntities.map(e => e.id).includes(entity.id);
    }, [selectedEntities]);

    return {
        selectedEntities,
        setSelectedEntities,
        isEntitySelected,
        toggleEntitySelection
    };
}
