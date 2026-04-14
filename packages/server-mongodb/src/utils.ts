export function getEntityIndex(entities: { id: string | number }[], entity: { id: string | number }): number | null {
    const idx = entities.findIndex(e => e.id === entity.id);
    return idx === -1 ? null : idx;
}

export function removeValueAtIndex<T>(arr: T[], index: number): T[] {
    const copy = [...arr];
    copy.splice(index, 1);
    return copy;
}

export function addValueAtIndex<T>(arr: T[], index: number, value: T): T[] {
    const copy = [...arr];
    copy.splice(index, 0, value);
    return copy;
}

export function replaceValueAtIndex<T>(arr: T[], index: number, value: T): T[] {
    const copy = [...arr];
    copy.splice(index, 1, value);
    return copy;
}

export function updateValueAtIndex<T>(arr: T[], index: number, updater: (val: T) => T): T[] {
    const copy = [...arr];
    copy[index] = updater(copy[index]);
    return copy;
}
