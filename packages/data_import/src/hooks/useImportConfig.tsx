import { useState } from "react";
import { Property } from "firecms";
import { ImportConfig } from "../types";

export const useImportConfig = (): ImportConfig => {
    const [inUse, setInUse] = useState<boolean>(false);
    const [idColumn, setIdColumn] = useState<string | undefined>();
    const [data, setData] = useState<object[]>([]);
    const [headersMapping, setHeadersMapping] = useState<Record<string, string>>({});
    const [properties, setProperties] = useState<Record<string, Property>>({});

    return {
        inUse,
        setInUse,
        idColumn,
        setIdColumn,
        data,
        setData,
        headersMapping,
        setHeadersMapping,
        properties,
        setProperties
    };
};
