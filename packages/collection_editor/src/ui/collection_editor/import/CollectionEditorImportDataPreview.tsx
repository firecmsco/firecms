import { convertDataToEntity, getPropertiesMapping, ImportConfig } from "@firecms/data_import_export";
import { EntityCollectionTable, Properties, Typography, useSelectionController } from "@firecms/core";
import { useEffect } from "react";

export function CollectionEditorImportDataPreview({ importConfig, properties, propertiesOrder }: {
    importConfig: ImportConfig,
    properties: Properties,
    propertiesOrder: string[]
}) {

    useEffect(() => {
        const propertiesMapping = getPropertiesMapping(importConfig.originProperties, properties);
        const mappedData = importConfig.importData.map(d => convertDataToEntity(d, importConfig.idColumn, importConfig.headersMapping, properties, propertiesMapping, "TEMP_PATH"));
        importConfig.setEntities(mappedData);
        console.log("res", { propertiesMapping, mappedData })
    }, []);

    const selectionController = useSelectionController();

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
        displayedColumnIds={propertiesOrder.map(p => ({ key: p, disabled: false }))}
        properties={properties}/>

}
