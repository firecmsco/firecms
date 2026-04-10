import { useCollectionRegistryController } from "../../../_cms_internals";
import { convertDataToEntity, ImportConfig } from "../../../_cms_internals";
import { useAuthController } from "@rebasepro/core";
import { EntityCollectionTable, useSelectionController } from "../../../_cms_internals";
import { CircularProgressCenter } from "@rebasepro/ui";
import { Properties } from "@rebasepro/types";
import { useEffect, useState } from "react";
import { Typography } from "@rebasepro/ui";

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
    const registry = useCollectionRegistryController();
    const [loading, setLoading] = useState<boolean>(false);

    async function loadEntities() {
        const mappedData = importConfig.importData.map(d => convertDataToEntity(authController,
            registry,
            d,
            importConfig.idColumn,
            importConfig.headersMapping,
            properties,
            "TEMP_PATH",
            importConfig.defaultValues));
        importConfig.setEntities(mappedData);
    }

    useEffect(() => {
        loadEntities().finally(() => setLoading(false));
    }, []);

    const selectionController = useSelectionController();
    if (loading)
        return <CircularProgressCenter />

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
        endAdornment={<div className={"h-12"} />}
        filterable={false}
        sortable={false}
        selectionController={selectionController}
        displayedColumnIds={propertiesOrder.map(p => ({
            key: p,
            disabled: false
        }))}
        openEntityMode={"side_panel"}
        properties={properties}
        enablePopupIcon={false} />

}
