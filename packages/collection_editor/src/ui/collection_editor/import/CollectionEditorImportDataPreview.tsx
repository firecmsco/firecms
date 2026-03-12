import { convertDataToEntity, ImportConfig } from "@firecms/data_import";
import {
    CircularProgressCenter,
    EntityCollectionTable,
    Properties,
    useAuthController,
    useNavigationController,
    useSelectionController,
    useTranslation
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
    const { t } = useTranslation();


    const authController = useAuthController();
    const navigation = useNavigationController();
    const [loading, setLoading] = useState<boolean>(false);

    async function loadEntities() {
        const mappedData = importConfig.importData.map(d => convertDataToEntity(authController,
            navigation,
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
        return <CircularProgressCenter/>

    return <EntityCollectionTable
        title={<div>
            <Typography variant={"subtitle2"}>{t("imported_data_preview")}</Typography>
            <Typography variant={"caption"}>{t("entities_with_same_id_overwritten")}</Typography>
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
