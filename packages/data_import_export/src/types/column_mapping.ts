import React from "react";
import { DataType, Entity, Property } from "@firecms/core";

export type ImportConfig = {

    inUse: boolean;
    setInUse: React.Dispatch<React.SetStateAction<boolean>>;

    idColumn: string | undefined;
    setIdColumn: React.Dispatch<React.SetStateAction<string | undefined>>;

    importData: object[];
    setImportData: React.Dispatch<React.SetStateAction<object[]>>;

    entities: Entity<any>[];
    setEntities: React.Dispatch<React.SetStateAction<Entity<any>[]>>;

    // mapping of the column name in the import file to the property key in the data model
    headersMapping: Record<string, string | null>;
    setHeadersMapping: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;

    originProperties: Record<string, Property>;
    setOriginProperties: React.Dispatch<React.SetStateAction<Record<string, Property>>>;

    headingsOrder: string[];
    setHeadingsOrder: React.Dispatch<React.SetStateAction<string[]>>;

}

export type DataTypeMapping = {
    from: DataType;
    fromSubtype?: DataType;
    to: DataType;
    toSubtype?: DataType;
}
