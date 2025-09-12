import React from "react";
import { getTableCellAlignment, getTablePropertyColumnWidth } from "./internal/common";
import { FilterValues, Properties, Property } from "@firecms/types";
import { VirtualTableColumn } from "../VirtualTable";
import { getIconForProperty, getResolvedPropertyInPath } from "../../util";
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
    properties: Properties;
    sortable?: boolean;
    forceFilter?: FilterValues<keyof M extends string ? keyof M : never>;
    AdditionalHeaderWidget?: React.ComponentType<{
        property: Property,
        propertyKey: string,
        onHover: boolean,
    }>;
}

export function propertiesToColumns<M extends Record<string, any>>({ properties, sortable, forceFilter, AdditionalHeaderWidget }: PropertiesToColumnsParams<M>): VirtualTableColumn[] {
    const disabledFilter = Boolean(forceFilter);
    return Object.entries<Property>(properties)
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
                sortable: sortable,
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

function filterableProperty(property: Property, partOfArray = false): boolean {
    if (partOfArray) {
        return ["string", "number", "date", "reference", "relation"].includes(property.type);
    }
    if (property.type === "array") {
        if (property.of && !Array.isArray(property.of))
            return filterableProperty(property.of, true);
        else
            return false;
    }
    return ["string", "number", "boolean", "date", "reference", "relation", "array"].includes(property.type);
}
