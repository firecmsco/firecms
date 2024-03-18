import React from "react";

import {
    buildCollection,
    Chip,
    Entity,
    EntityCollectionView,
    EntityReference,
    FilterValues,
    ReferenceWidget,
    useAuthController,
    useReferenceDialog,
    useSelectionController,
    useSideEntityController,
    useSnackbarController
} from "@firecms/firebase_pro";
import { Button, GitHubIcon, IconButton, Paper, Tooltip, Typography } from "@firecms/ui";
import { Product } from "./types";
import { usersCollection } from "./collections/users_collection";

/**
 * Sample CMS view not bound to a collection, customizable by the developer
 * @constructor
 */
export function ExampleCMSView() {

    // hook to display custom snackbars
    const snackbarController = useSnackbarController();

    const selectionController = useSelectionController();

    const [sampleSelectedProduct, setSampleSelectedProduct] = React.useState<EntityReference | null>();

    // hook to open the side dialog that shows the entity forms
    const sideEntityController = useSideEntityController();

    // hook to do operations related to authentication
    const authController = useAuthController();

    // const [forceFilter, setForceFilter] = React.useState<FilterValues<any> | undefined>(undefined);

    // hook to open a reference dialog
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Selected " + entity?.values.name
            })
        }
    });

    const customProductCollection = buildCollection({
        id: "custom_product",
        path: "custom_product",
        name: "Custom products",
        properties: {
            name: {
                name: "Name",
                validation: { required: true },
                dataType: "string"
            },
            very_custom_field: {
                name: "Very custom field",
                dataType: "string"
            }
        }
    });

    const githubLink = (
        <Tooltip
            title="Get the source code of this example view">
            <IconButton
                href={"https://github.com/firecmsco/firecms/blob/main/examples/example_v3/src/views/ExampleCMSView.tsx"}
                rel="noopener noreferrer"
                target="_blank"
                component={"a"}
                size="large">
                <GitHubIcon/>
            </IconButton>
        </Tooltip>
    );

    return (
        <div className="flex h-full">
            <div className="m-auto flex flex-col items-center max-w-4xl">

                <div className="flex flex-col gap-12 items-start">

                    <div className="mt-24">
                        <Typography variant="h4">
                            This is an example of an additional view
                        </Typography>
                        <p>
                            {authController.user
                                ? <>Logged in as <Chip>{authController.user.displayName}</Chip></>
                                : <>You are not logged in</>}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Paper className={"w-full flex flex-col p-4 items-start"}>
                            <p className="mb-4 flex-grow">
                                Use this button to select an entity under the
                                path <code>products</code> programmatically
                            </p>
                            <Button
                                variant={"outlined"}
                                size={"small"}
                                onClick={referenceDialog.open}>
                                Test reference dialog
                            </Button>
                        </Paper>

                        <Paper className="w-full flex flex-col p-4 items-start">
                            <p className="mb-4 flex-grow">
                                Use this button to open a snackbar
                            </p>
                            <Button
                                variant={"outlined"}
                                size={"small"}
                                onClick={() => snackbarController.open({
                                    type: "success",
                                    message: "This is pretty cool"
                                })}>
                                Test snackbar
                            </Button>
                        </Paper>

                        <Paper className="w-full flex flex-col p-4 items-start">
                            <p className="mb-4 flex-grow">
                                Use this button to open an entity in a custom path with a custom schema
                            </p>
                            <Button
                                size={"small"}
                                variant={"outlined"}
                                onClick={() => sideEntityController.open({
                                    entityId: "B003WT1622",
                                    path: "/products-test",
                                    collection: customProductCollection,
                                    width: 1000
                                })}>
                                Open custom entity
                            </Button>
                        </Paper>
                    </div>

                    <div className={"w-full"}>
                        <Typography className={"mb-4"}>
                            You can include reference widgets in your views:
                        </Typography>
                        {/*<Button*/}
                        {/*    onClick={() => setForceFilter({ name: ["==", "A"] })}*/}
                        {/*>*/}
                        {/*    Filter A*/}
                        {/*</Button>*/}
                        <ReferenceWidget
                            name={"Sample reference widget"}
                            value={sampleSelectedProduct ?? null}
                            onReferenceSelected={({ reference, entity }) => setSampleSelectedProduct(reference)}
                            path={"products"}
                            size={"small"}
                            className={"w-full"}/>
                    </div>

                    <div className="w-full">
                        <p className="mb-4">
                            You can include full entity collections in your views:
                        </p>
                        <Paper
                            className={"h-[400px]"}>
                            <EntityCollectionView {...usersCollection}
                                                  fullPath={"users"}
                                                  selectionController={selectionController}/>
                        </Paper>
                    </div>

                    <div className="mt-auto">
                        {githubLink}
                    </div>

                </div>
            </div>
        </div>
    );
}
