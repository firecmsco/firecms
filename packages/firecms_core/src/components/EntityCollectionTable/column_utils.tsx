import React from "react";
import { getTableCellAlignment, getTablePropertyColumnWidth } from "./internal/common";
import { FilterValues, ResolvedProperties, ResolvedProperty } from "../../types";
import { VirtualTableColumn } from "../VirtualTable";
import { getIconForProperty, getResolvedPropertyInPath } from "../../util";
import { getColumnKeysForProperty } from "../EntityCollectionView/useColumnsIds";

export function buildIdColumn(largeLayout?: boolean): VirtualTableColumn {
    return {
        key: "id_ewcfedcswdf3",
        width: (largeLayout ? 160 : 130),
        title: "ID",
        resizable: false,
        frozen: largeLayout ?? false,
        headerAlign: "center",
        align: "center",
    };
}

export interface PropertiesToColumnsParams<M extends Record<string, any>> {
    properties: ResolvedProperties<M>;
    sortable?: boolean;
    forceFilter?: FilterValues<keyof M extends string ? keyof M : never>;
    disabledFilter?: boolean;
    AdditionalHeaderWidget?: React.ComponentType<{
        property: ResolvedProperty,
        propertyKey: string,
        onHover: boolean,
    }>;
}

export function propertiesToColumns<M extends Record<string, any>>({ properties, sortable, forceFilter, disabledFilter, AdditionalHeaderWidget }: PropertiesToColumnsParams<M>): VirtualTableColumn[] {
    return Object.entries<ResolvedProperty>(properties)
        .flatMap(([key, property]) => getColumnKeysForProperty(property, key))
        .map(({
                  key,
                  disabled
              }) => {
            const property = getResolvedPropertyInPath(properties, key);
            if (!property)
                throw Error("Internal error: no property found in path " + key);
            const filterable = filterableProperty(property);
            return {
                key: key as string,
                align: getTableCellAlignment(property),
                icon: getIconForProperty(property, "small"),
                title: property.name ?? key as string,
                sortable: sortable && (forceFilter ? Object.keys(forceFilter).includes(key) : true),
                filter: !disabledFilter && filterable,
                width: getTablePropertyColumnWidth(property),
                resizable: true,
                custom: {
                    resolvedProperty: property,
                    disabled
                },
                AdditionalHeaderWidget: AdditionalHeaderWidget
                    ? ({ onHover }) => <AdditionalHeaderWidget property={property} propertyKey={key} onHover={onHover}/>
                    : undefined
            } satisfies VirtualTableColumn;
        });
}

function filterableProperty(property: ResolvedProperty, partOfArray = false): boolean {
    if (partOfArray) {
        return ["string", "number", "date", "reference"].includes(property.dataType);
    }
    if (property.dataType === "array") {
        if (property.of)
            return filterableProperty(property.of, true);
        else
            return false;
    }
    return ["string", "number", "boolean", "date", "reference", "array"].includes(property.dataType);
}
