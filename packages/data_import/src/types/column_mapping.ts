import React from "react";
import { Entity, Property } from "firecms";

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
    headersMapping: Record<string, string>;
    setHeadersMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;

    // mapping of the property key in the data model to the property
    // properties: Record<string, Property>;
    // setProperties: React.Dispatch<React.SetStateAction<Record<string, Property>>>;

}
