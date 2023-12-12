import React from "react";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    Grid,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from "@mui/material";
import { GitHub } from "@mui/icons-material";

import {
    buildCollection,
    Entity,
    EntityCollectionView,
    useAuthController,
    useReferenceDialog,
    useSelectionController,
    useSideEntityController,
    useSnackbarController
} from "firecms";
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

    console.log("Selection from ExampleCMSView", selectionController.selectedEntities);

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
                href={"https://github.com/FireCMSco/firecms/blob/master/example/src/SampleApp/ExampleCMSView.tsx"}
                rel="noopener noreferrer"
                target="_blank"
                component={"a"}
                size="large">
                <GitHub/>
            </IconButton>
        </Tooltip>
    );

    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>

            <Box m="auto"
                 display="flex"
                 flexDirection={"column"}
                 alignItems={"center"}
                 justifyItems={"center"}>

                <Container maxWidth={"md"}
                           sx={{
                               my: 4
                           }}>

                    <Grid container rowSpacing={5} columnSpacing={2}>

                        <Grid item xs={12}>
                            <Typography variant={"h4"}>
                                This is an example of an
                                additional view
                            </Typography>
                            <Typography>
                                {authController.user
                                    ? <>Logged in
                                        as {authController.user.displayName}</>
                                    : <>You are not logged in</>}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{ height: "100%" }}>
                                <CardContent>
                                    <Typography>
                                        Use this button to select an entity
                                        under
                                        the path `products` programmatically
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        onClick={referenceDialog.open}
                                        color="primary">
                                        Test reference dialog
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography>
                                        Use this button to open a snackbar
                                    </Typography>
                                </CardContent>

                                <CardActions>
                                    <Button
                                        onClick={() => snackbarController.open({
                                            type: "success",
                                            message: "This is pretty cool"
                                        })}
                                        color="primary">
                                        Test snackbar
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{ height: "100%" }}>
                                <CardContent>
                                    <Typography>
                                        Use this button to open an entity in a
                                        custom path with a custom schema
                                    </Typography>
                                </CardContent>

                                <CardActions>
                                    <Button
                                        onClick={() => sideEntityController.open({
                                            entityId: "B003WT1622",
                                            path: "/products-test", // this path is not mapped in our collections
                                            collection: customProductCollection,
                                            width: 800
                                        })}
                                        color="primary">
                                        Open custom entity
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 3 }}>
                            <Typography>
                                You can include full entity collections in
                                your views:
                            </Typography>

                            <Paper
                                variant={"outlined"}
                                sx={{
                                    // width: 800,
                                    height: 400,
                                    overflow: "hidden",
                                    my: 2
                                }}>
                                <EntityCollectionView {...usersCollection}
                                                      fullPath={"users"}
                                                      selectionController={selectionController}/>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            {githubLink}
                        </Grid>

                    </Grid>

                </Container>
            </Box>
        </Box>
    );
}
