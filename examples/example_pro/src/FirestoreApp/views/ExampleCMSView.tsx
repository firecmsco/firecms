import React, { useState } from "react";

import {
    buildCollection,
    Entity,
    EntityCollectionView,
    EntityReference,
    ReferenceWidget,
    useAuthController,
    useReferenceDialog,
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
import { Product } from "../types";
import { usersCollection } from "../collections/users_collection";

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

    const frameworksList = [
        {
            value: "react",
            label: "React",
        },
        {
            value: "angular",
            label: "Angular",
        },
        {
            value: "vue",
            label: "Vue",
        },
        {
            value: "svelte",
            label: "Svelte",
        },
        {
            value: "ember",
            label: "Ember",
        },
    ];

    const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(["react", "angular"]);

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

                    <div className="w-full">
                        <MultiSelect
                            className={"w-full"}
                            value={selectedFrameworks ?? []}
                            onValueChange={setSelectedFrameworks}
                            placeholder="Select frameworks"
                        >
                            {frameworksList.map((framework) => (
                                <MultiSelectItem
                                    key={framework.value}
                                    value={framework.value}>
                                    {framework.label}
                                </MultiSelectItem>
                            ))}
                        </MultiSelect>
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold">Selected Frameworks:</h2>
                            <ul className="list-disc list-inside">
                                {selectedFrameworks.map((framework) => (
                                    <li key={framework}>{framework}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="w-full flex gap-2">
                        <TextField
                            size={"small"}
                            placeholder="Invite others by email"
                            className="flex-grow"
                            endAdornment={<Select
                                size={"small"}
                                value={"read"}>
                                <SelectItem value={"write"}>Can edit</SelectItem>
                                <SelectItem value={"read"}>Can view</SelectItem>
                            </Select>}
                        />
                        <Button variant="neutral">
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
                                    path: "/products",
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
                                                  fullPath={"users"}
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
