import React from "react";

import {
    buildIdColumn,
    CellRendererParams,
    Entity,
    EntityCollectionRowActions,
    ErrorBoundary,
    getPropertyInPath,
    getValueInPath,
    OnCellValueChangeParams,
    Paper,
    propertiesToColumns,
    PropertyOrBuilder,
    PropertyTableCell,
    resolveProperty,
    SimpleTable,
    useDataSourceEntityCollectionTableController
} from "firecms";
import { usersCollection } from "../collections/users_collection";

/**
 * Sample CMS view not bound to a collection, customizable by the developer
 * @constructor
 */
export function SampleCustomEntityCollection() {

    const path = "users";
    const collection = usersCollection;

    const idColumn = buildIdColumn();
    const propertyColumns = propertiesToColumns({
        properties: collection.properties,
    });

    const columns = [idColumn, ...propertyColumns];
    const tableController = useDataSourceEntityCollectionTableController({
        fullPath: path,
        collection: collection,
    });

    const getPropertyFor = ({
                                propertyKey,
                                propertyValue,
                                entity
                            }: {
        propertyKey: string,
        propertyValue: any,
        entity: Entity<any>
    }) => {
        let propertyOrBuilder: PropertyOrBuilder | undefined = getPropertyInPath(collection.properties, propertyKey);

        if (!propertyOrBuilder) {
            propertyOrBuilder = getPropertyInPath(collection.properties, propertyKey) as PropertyOrBuilder;
        }

        return resolveProperty({
            propertyKey,
            propertyOrBuilder,
            path,
            propertyValue,
            values: entity.values,
            entityId: entity.id
        });
    };

    const onValueChange = (params: OnCellValueChangeParams) => {
        console.log("onValueChange", params)
    }

    const cellRenderer = ({
                              column,
                              columnIndex,
                              rowData,
                              rowIndex
                          }: CellRendererParams<any>) => {

        const entity: Entity<any> = rowData;

        const propertyKey = column.key;

        let disabled = column.custom?.disabled;
        const propertyValue = entity.values ? getValueInPath(entity.values, propertyKey) : undefined;

        if (columnIndex === 0) {
            return <EntityCollectionRowActions entity={entity}
                                               width={column.width}
                                               size={"m"}/>
        }

        const property = getPropertyFor({
            propertyKey,
            propertyValue,
            entity
        });
        if (!property?.disabled) {
            disabled = false;
        }

        if (!property) {
            return null;
        }

        return (
            <ErrorBoundary>
                {entity
                    ? <PropertyTableCell
                        key={`property_table_cell_${entity.id}_${propertyKey}`}
                        readonly={false}
                        align={column.align ?? "left"}
                        propertyKey={propertyKey as string}
                        property={property}
                        value={entity?.values ? getValueInPath(entity.values, propertyKey) : undefined}
                        columnIndex={columnIndex}
                        width={column.width}
                        height={100}
                        entity={entity}
                        disabled={disabled}
                        path={entity.path}/>
                    : null
                }
            </ErrorBoundary>);

    };

    return (
        <div className="flex h-full w-full items-center justify-center">
            <Paper className={"h-[300px] w-full md:w-3/4"}>
                <SimpleTable columns={columns}
                             cellRenderer={cellRenderer}
                             tableController={tableController}
                             onValueChange={onValueChange}/>
            </Paper>
        </div>
    );
}
