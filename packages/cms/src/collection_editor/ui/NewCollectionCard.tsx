import {
    useAuthController,
    useTranslation
} from "@rebasepro/core";
import { PluginHomePageAdditionalCardsProps } from "@rebasepro/types";
import { AddIcon, Card, cls, Typography } from "@rebasepro/ui";
import { useCollectionEditorController } from "../useCollectionEditorController";

export function NewCollectionCard({
    group,
    context
}: PluginHomePageAdditionalCardsProps) {

    if (!context.navigationStateController?.topLevelNavigation)
        return null;

    const authController = useAuthController();

    const collectionEditorController = useCollectionEditorController();
    const { t } = useTranslation();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
        }).createCollections
        : true;

    return (
        <Card className={cls("h-full p-4 min-h-[124px]")}
            onClick={collectionEditorController && canCreateCollections
                ? () => collectionEditorController.createCollection({
                    initialValues: group ? { group } : undefined,
                    parentCollectionIds: [],
                    redirect: true,
                    sourceClick: "new_collection_card"
                })
                : undefined}>

            <div
                className="flex items-center justify-center h-full w-full grow flex-col">
                <AddIcon color="primary" />
                <Typography color="primary"
                    variant={"caption"}
                    className={"font-medium"}>{t("studio_new_collection_add").toUpperCase()}</Typography>

                {!canCreateCollections &&
                    <Typography variant={"caption"}>{t("studio_new_collection_no_permission")}</Typography>
                }
            </div>

        </Card>
    );
}
