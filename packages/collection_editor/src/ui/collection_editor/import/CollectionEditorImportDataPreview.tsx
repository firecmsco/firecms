import { convertDataToEntity, getPropertiesMapping, ImportConfig } from "@firecms/data_import_export";
import { CircularProgressCenter, EntityCollectionTable, Properties, useSelectionController } from "@firecms/core";
import { useEffect, useState } from "react";
import { Typography } from "@firecms/ui";

export function CollectionEditorImportDataPreview({
                                                      importConfig,
                                                      properties,
                                                      propertiesOrder
                                                  }: {
    importConfig: ImportConfig,
    properties: Properties,
    propertiesOrder: string[]
}) {

    const [loading, setLoading] = useState<boolean>(false);

    async function loadEntities() {
        const propertiesMapping = getPropertiesMapping(importConfig.originProperties, properties);
        const mappedData = importConfig.importData.map(d => convertDataToEntity(d, importConfig.idColumn, importConfig.headersMapping, properties, propertiesMapping, "TEMP_PATH"));
        importConfig.setEntities(mappedData);
    }

    useEffect(() => {
        loadEntities().finally(() => setLoading(false));
    }, []);

    const selectionController = useSelectionController();
    if (loading)
        return <CircularProgressCenter/>

    return <EntityCollectionTable
        title={<div>
            <Typography variant={"subtitle2"}>Imported data preview</Typography>
            <Typography variant={"caption"}>Entities with the same id will be overwritten</Typography>
        </div>}
        tableController={{
            data: importConfig.entities,
            dataLoading: false,
            noMoreToLoad: false
        }}
        endAdornment={<div className={"h-12"}/>}
        filterable={false}
        sortable={false}
        selectionController={selectionController}
        displayedColumnIds={propertiesOrder.map(p => ({
            key: p,
            disabled: false
        }))}
        properties={properties}/>

}
