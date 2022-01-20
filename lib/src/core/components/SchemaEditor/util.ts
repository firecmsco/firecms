import { PropertiesOrBuilder, Property } from "../../../models";

export type ItemId = string | number;

export interface TreeData {
    rootId: ItemId;
    items: Record<ItemId, TreeItem>;
}

export type TreeItemData = any;
export type TreeItem = {
    id: ItemId;
    children: ItemId[];
    hasChildren?: boolean;
    isExpanded?: boolean;
    isChildrenLoading?: boolean;
    data?: TreeItemData;
};

export function propertiesToTree<M>(properties: PropertiesOrBuilder<M>): TreeData {
    const treeItems = getTreeItems(properties);
    const items = treeItems
        .map((item) => ({ [item.id]: item }))
        .reduce((a, b) => ({ ...a, ...b }), {});

    const rootChildren = treeItems.filter((item) => item.data.isInRoot).map(item => item.id);
    return {
        rootId: "root",
        items: {
            root: {
                id: "root",
                isExpanded: true,
                children: rootChildren
            },
            ...items
        }
    };
}

function getTreeItems(properties: PropertiesOrBuilder<any>, namespace?: string): TreeItem[] {

    return Object.entries(properties)
        .map(([key, property]) => {
            let children: TreeItem[] = [];
            const fullId = namespace ? `${namespace}.${key}` : key;
            if (typeof property === "object" && property.dataType === "map" && property.properties) {
                children = getTreeItems(property.properties, fullId);
            }
            return [({
                id: fullId,
                isExpanded: true,
                data: { isInRoot: !namespace, id: key, property },
                children: children.map((c) => c.id)
            }), ...children];
        }).reduce((a, b) => [...a, ...b], []);
}

export function treeToProperties<M>(treeData: TreeData): [PropertiesOrBuilder<M>, (keyof M)[]] {

    const items = { ...treeData.items };
    const root = items.root;

    Object.entries(items)
        .filter(([id]) => id !== "root")
        .forEach(([id, item]) => {
            const property: Property = item.data.property;
            if (property.dataType === "map") {
                property.properties = item.children
                    .map((cid) => ({ [items[cid].data.id]: items[cid].data.property }))
                    .reduce((a, b) => ({ ...a, ...b }), {});
                property.propertiesOrder = item.children.map((cid) => items[cid].data.id);
            }
            return [id, item];
        });

    const res = Object.entries(items)
        .filter(([id, _]) => root.children.includes(id))
        .map(([id, item]) => ({ [item.data.id]: item.data.property }))
        .reduce((a, b) => ({ ...a, ...b }), {}) as PropertiesOrBuilder<M>;

    const rootIds = root.children.map((id) => items[id].data.id) as (keyof M)[];
    return [res, rootIds];
}
