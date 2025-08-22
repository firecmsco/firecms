import { convertDataToEntity, ImportConfig } from "@firecms/data_import";
import {
    CircularProgressCenter,
    EntityCollectionTable,
    Properties,
    useAuthController,
    useSelectionController
} from "@firecms/core";
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

    const authController = useAuthController();
    const [loading, setLoading] = useState<boolean>(false);

    async function loadEntities() {
        // const propertiesMapping = getPropertiesMapping(importConfig.originProperties, properties, importConfig.headersMapping);
        const mappedData = importConfig.importData.map(d => convertDataToEntity(authController, d, importConfig.idColumn, importConfig.headersMapping, properties, "TEMP_PATH", importConfig.defaultValues));
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
        openEntityMode={"side_panel"}
        properties={properties}
        enablePopupIcon={false}/>

}
