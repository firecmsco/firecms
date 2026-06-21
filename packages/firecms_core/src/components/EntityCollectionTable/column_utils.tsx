import React from "react";
import { getTableCellAlignment, getTablePropertyColumnWidth } from "./internal/common";
import { FilterValues, ResolvedProperties, ResolvedProperty } from "../../types";
import { VirtualTableColumn } from "../VirtualTable";
import { getIconForProperty, getResolvedPropertyInPath, isDataTypeFilterable } from "../../util";
import { getColumnKeysForProperty } from "../common/useColumnsIds";

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
    forceFilters: (keyof M)[];
    allowedFilters: (keyof M)[];
    AdditionalHeaderWidget?: React.ComponentType<{
        property: ResolvedProperty,
        propertyKey: string,
        onHover: boolean,
    }>;
}

export function propertiesToColumns<M extends Record<string, any>>({ properties, sortable, forceFilters, AdditionalHeaderWidget, allowedFilters }: PropertiesToColumnsParams<M>): VirtualTableColumn[] {
    return Object.entries<ResolvedProperty>(properties)
        .flatMap(([key, property]) => getColumnKeysForProperty(property, key))
        .map(({
                  key,
                  disabled
              }) => {
            const property = getResolvedPropertyInPath(properties, key);
            if (!property)
                throw Error("Internal error: no property found in path " + key);

            const filterable = property.dataType === 'array' ? isDataTypeFilterable(property.of?.dataType, true) : isDataTypeFilterable(property.dataType);
            const isFilterForced = forceFilters.includes(key);
            const isFilterAllowed = allowedFilters.includes(key);

            const filterEnabled = filterable && isFilterAllowed && !isFilterForced;
            return {
                key: key as string,
                align: getTableCellAlignment(property),
                icon: getIconForProperty(property, "small"),
                title: property.name ?? key as string,
                sortable: sortable,
                filter: filterEnabled,
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
