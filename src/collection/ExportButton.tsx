import React, { useEffect } from "react";
import {
    Entity,
    EntitySchema,
    listenCollection,
    Properties,
    Property
} from "../models";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import { CSVLink } from "react-csv";
import { buildPropertyFrom } from "../models";
import { computeSchemaProperties, PropertiesValues } from "../models/firestore";
import firebase from "firebase";
import GetAppIcon from "@material-ui/icons/GetApp";

type ExportButtonProps<S extends EntitySchema<Key>, Key extends string> = {
    schema: S;
    collectionPath: string;
}

export default function ExportButton<S extends EntitySchema<Key>, Key extends string>({
                                                                                          schema,
                                                                                          collectionPath
                                                                                      }: ExportButtonProps<S, Key>
) {

    const [data, setData] = React.useState<Entity<S, Key>[]>();
    const [dataLoading, setDataLoading] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();

    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        setDataLoading(true);
        const cancelSubscription = listenCollection<S, Key>(
            collectionPath,
            schema,
            entities => {
                setDataLoading(false);
                setDataLoadingError(undefined);
                setData(entities);
            },
            (error) => {
                console.error("ERROR", error);
                setDataLoading(false);
                setDataLoadingError(error);
            },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined);
        return cancelSubscription;
    }, [collectionPath, schema]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDownload = () => {
        setOpen(false);
    };

    const properties = computeSchemaProperties(schema);
    const exportableData = data && data.map(e => ({ id: e.id, ...processProperties(e.values as any, properties) }));

    const headers = getExportHeaders(properties);

    return (
        <>

            <Tooltip title={"Export"}>
                <IconButton
                    color={"primary"}
                    onClick={handleClickOpen}>
                    <GetAppIcon/>
                </IconButton>
            </Tooltip>

            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>Export data</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Download the the content of this table as a CSV
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button color="primary" onClick={handleClose}>
                        Cancel
                    </Button>

                    {dataLoading && <CircularProgress size={16} thickness={8}/>}

                    {exportableData &&
                    <CSVLink headers={headers}
                             data={exportableData}
                             filename={schema.name}
                             style={{
                                 textDecoration: "none"
                             }}
                             target="_blank"
                    >
                        <Button color="primary" autoFocus
                                onClick={handleDownload}>
                            Download
                        </Button>
                    </CSVLink>
                    }

                </DialogActions>
            </Dialog>

        </>
    );
}

type Header = { label: string, key: string };

function getExportHeaders(properties: Properties<any>): Header[] {
    return [
        { label: "id", key: "id" },
        ...Object.entries(properties)
            .map(([childKey, propertyOrBuilder]) => {
                const property = buildPropertyFrom(propertyOrBuilder, {}, undefined);
                return getHeaders(property, childKey, "");
            })
            .flat()
    ];
}

function getHeaders(property: Property, propertyKey: string, prefix: string = ""): Header[] {
    let currentKey = prefix ? `${prefix}.${propertyKey}` : propertyKey;
    if (property.dataType === "map" && property.properties) {
        return Object.entries(property.properties)
            .map(([childKey, p]) => getHeaders(p, childKey, currentKey))
            .flat();
    } else {
        return [{ label: currentKey, key: currentKey }];
    }
}


function processProperty(inputValue: any,
                         property: Property): any {

    let value;
    if (property.dataType === "map" && property.properties) {
        value = processProperties(inputValue, property.properties);
    } else if (property.dataType === "array") {
        if (property.of && Array.isArray(inputValue)) {
            value = inputValue.map((e) => processProperty(e, property.of as Property));
        } else {
            value = inputValue;
        }
    } else if (property.dataType === "reference") {
        const ref = inputValue ? inputValue as firebase.firestore.DocumentReference : undefined;
        value = ref ? ref.path : null;
    } else if (property.dataType === "timestamp") {
        value = inputValue ? inputValue.getTime() : null;
    } else {
        value = inputValue;
    }

    return value;
}

function processProperties<S extends EntitySchema<Key>,
    P extends Properties<Key>, Key extends string>
(inputValues: Partial<PropertiesValues<S, Key>>, properties: P): PropertiesValues<S, Key> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues as any)[key];
            const updatedValue = processProperty(inputValue, property as Property);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as PropertiesValues<S, Key>;
    return { ...inputValues, ...updatedValues };
}

