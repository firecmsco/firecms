import React from "react";
import { EntityCollection, EntitySchema } from "../models";
import { createStyles, makeStyles } from "@material-ui/core";
import { EntityDrawer } from "./EntityDrawer";
import EntityView from "./EntityView";
import { useSideEntityController } from "../contexts/SideEntityPanelsController";
import { useSchemaOverrideRegistry } from "./SchemaOverrideRegistry";
import { SchemaSidePanelProps, SideEntityPanelProps } from "./model";
import { ErrorBoundary } from "../components";
import { getCollectionViewFromPath } from "../routes/navigation";


export const useStyles = makeStyles(theme => createStyles({
    root: {
        width: "45vw",
        height: "100%",
        maxWidth: "1000px",
        [theme.breakpoints.down("md")]: {
            width: "60vw"
        },
        [theme.breakpoints.down("sm")]: {
            width: "85vw"
        },
        [theme.breakpoints.down("xs")]: {
            width: "100vw"
        },
        transition: "width 155ms cubic-bezier(0.33, 1, 0.68, 1)"
    },
    wide: {
        width: "65vw",
        height: "100%",
        maxWidth: "1500px",
        [theme.breakpoints.down("md")]: {
            width: "80vw"
        },
        [theme.breakpoints.down("sm")]: {
            width: "95vw"
        },
        [theme.breakpoints.down("xs")]: {
            width: "100vw"
        },
        transition: "width 150ms cubic-bezier(0.33, 1, 0.68, 1)"
    }
}));


export function EntitySideDialogs<S extends EntitySchema>({ navigation }: { navigation: EntityCollection[] }) {

    const sideEntityController = useSideEntityController();
    const schemasRegistry = useSchemaOverrideRegistry();

    const classes = useStyles();

    const sidePanels = sideEntityController.sidePanels;
    // const [sidePanelBeingClosed, setSidePanelBeingClosed] = useState<SidePanelProps | undefined>();

    const onExitAnimation = () => {
        // setSidePanelBeingClosed(undefined);
    };

    const allPanels = [...sidePanels, undefined];

    function buildEntityView(panel: SideEntityPanelProps) {

        let extendedProps: SchemaSidePanelProps | null = schemasRegistry.get(panel.collectionPath);

        if (!extendedProps) {
            const entityCollection: EntityCollection = getCollectionViewFromPath(panel.collectionPath, navigation);
            const editEnabled = entityCollection.editEnabled == undefined || entityCollection.editEnabled;
            const schema = entityCollection.schema;
            const subcollections = entityCollection.subcollections;
            extendedProps = {
                editEnabled, schema, subcollections
            };
        }

        return (
            <ErrorBoundary>
                <EntityView
                    key={`side-form-route-${panel.entityId}`}
                    {...extendedProps}
                    {...panel}/>
            </ErrorBoundary>
        );
    }

    return (
        <>
            {/* we add an extra closed drawer, that it is used to maintain the transition when a drawer is removed */}
            {
                allPanels.map((panel: SideEntityPanelProps | undefined, index) => {

                    return (
                        <EntityDrawer
                            key={`side_menu_${index}`}
                            open={panel !== undefined}
                            onClose={() => {
                                sideEntityController.close();
                            }}
                            offsetPosition={sidePanels.length - index - 1}
                            onExitAnimation={onExitAnimation}
                        >
                            <div
                                className={panel === undefined || !panel.selectedSubcollection ? classes.root : classes.wide}>
                                {panel && buildEntityView(panel)}
                            </div>
                        </EntityDrawer>
                    );
                })
            }

        </>
    );
}

