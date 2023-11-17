import { AddIcon, Card, cn, PluginHomePageAdditionalCardsProps, Typography, useAuthController } from "@firecms/core";
import { useCollectionEditorController } from "../useCollectionEditorController";

export function NewCollectionCard({
                                      group,
                                      context
                                  }: PluginHomePageAdditionalCardsProps) {

    if (!context.navigation.topLevelNavigation)
        throw Error("Navigation not ready in FireCMSHomePage");

    const authController = useAuthController();

    const collectionEditorController = useCollectionEditorController();
    const canCreateCollections = collectionEditorController.configPermissions
        ? collectionEditorController.configPermissions({
            user: authController.user,
        }).createCollections
        : true;

    return (
        <Card className={cn("h-full p-4 min-h-[124px]")}
              onClick={collectionEditorController && canCreateCollections
                  ? () => collectionEditorController.createCollection({
                      initialValues: group ? { group } : undefined,
                      parentPathSegments: [],
                        redirect: true
                  })
                  : undefined}>

            <div
                className="flex flex-col items-start h-full w-full items-center justify-center h-full w-full flex-grow flex-col">
                <AddIcon color="primary"/>
                <Typography color="primary"
                            variant={"caption"}
                            className={"font-medium"}>{"Add new collection".toUpperCase()}</Typography>

                {!canCreateCollections &&
                    <Typography variant={"caption"}>You don&apos;t have permissions to create
                        collections</Typography>
                }
            </div>

        </Card>
    );
}
