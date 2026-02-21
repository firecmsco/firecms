import React, { useState } from "react";

import {
    buildCollection,
    Entity,
    EntityCollectionView,
    EntityReference,
    ReferenceWidget,
    useAuthController,
    useEntitySelectionDialog,
    useSelectionController,
    useSideEntityController,
    useSnackbarController
} from "@firecms/core";
import {
    Button,
    Chip,
    GitHubIcon,
    IconButton,
    MultiSelect,
    MultiSelectItem,
    Paper,
    Select,
    SelectItem,
    Sheet,
    TextField,
    Tooltip,
    Typography
} from "@firecms/ui";
import { usersCollection } from "../collections/users_collection";
import { Product } from "@/app/common/types";

/**
 * Sample CMS view not bound to a collection, customizable by the developer.
 * This view showcases some of the features available in FireCMS.
 * It is accessible from the navigation bar.
 *

 */
export function ExampleCMSView() {

    // hook to display custom snackbars
    const snackbarController = useSnackbarController();

    const [isSheetOpen, setOpenSheet] = React.useState(false);

    const [sampleSelectedProduct, setSampleSelectedProduct] = React.useState<EntityReference | null>();

    // hook to open the side dialog that shows the entity forms
    const sideEntityController = useSideEntityController();

    // hook to do operations related to authentication
    const authController = useAuthController();

    // hook to open a reference dialog
    const referenceDialog = useEntitySelectionDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Selected " + entity?.values.name
            })
        }
    });

    const customProductCollection = buildCollection({
        slug: "custom_product",
        dbPath: "custom_product",
        name: "Custom products",
        properties: {
            name: {
                name: "Name",
                validation: { required: true },
                type: "string"
            },
            very_custom_field: {
                name: "Very custom field",
                type: "string"
            }
        }
    });

    // in custom tables, you can manage the selected entities externally
    const tableSelectionController = useSelectionController();

    const githubLink = (
        <Tooltip
            title="Get the source code of this example view">
            <IconButton
                href={"https://github.com/firecmsco/firecms/blob/main/examples/example_cloud/src/views/ExampleCMSView.tsx"}
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
                        <div>
                            {authController.user
                                ? <>Logged in as <Chip>{authController.user.displayName}</Chip></>
                                : <>You are not logged in</>}
                        </div>
                    </div>

                    <div className="w-full flex gap-2">
                        <TextField
                            size={"small"}
                            placeholder="Invite others by email"
                            className="grow"
                            endAdornment={<Select
                                size={"small"}
                                value={"read"}>
                                <SelectItem value={"write"}>Can edit</SelectItem>
                                <SelectItem value={"read"}>Can view</SelectItem>
                            </Select>}
                        />
                        <Button color="neutral">
                            Invite
                        </Button>
                    </div>

                    <div>
                        <Button
                            variant={"outlined"}
                            size={"small"}
                            onClick={() => setOpenSheet(true)}>
                            Open bottom sheet
                        </Button>
                    </div>
                    <Sheet open={isSheetOpen}
                           onOpenChange={setOpenSheet}
                           side={"bottom"}>
                        <div className="bg-white font-bold dark:bg-surface-800 p-4 h-[90vh]">
                            Sheet Content
                        </div>
                    </Sheet>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Paper className={"w-full flex flex-col p-4 items-start"}>
                            <p className="mb-4 grow">
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
                            <p className="mb-4 grow">
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
                            <p className="mb-4 grow">
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
                        <ReferenceWidget
                            name={"Sample reference widget"}
                            value={sampleSelectedProduct ?? null}
                            onReferenceSelected={({
                                                      reference,
                                                      entity
                                                  }) => setSampleSelectedProduct(reference)}
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
                                                  path={"users"}
                                                  selectionController={tableSelectionController}/>
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
