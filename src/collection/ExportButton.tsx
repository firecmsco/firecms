import React, { useEffect } from "react";
import {
    buildPropertyFrom,
    Entity,
    EntitySchema,
    ExportConfig,
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
    useTheme
} from "@material-ui/core";
import { CSVLink } from "react-csv";
import { computeSchemaProperties, PropertiesValues } from "../models/firestore";
import firebase from "firebase";
import GetAppIcon from "@material-ui/icons/GetApp";

type ExportButtonProps<S extends EntitySchema<Key>, Key extends string> = {
    schema: S;
    collectionPath: string;
    exportConfig?: ExportConfig;
}

export default function ExportButton<S extends EntitySchema<Key>, Key extends string>({
                                                                                          schema,
                                                                                          collectionPath,
                                                                                          exportConfig
                                                                                      }: ExportButtonProps<S, Key>
) {

    const [data, setData] = React.useState<Entity<S, Key>[]>();
    const [additionalData, setAdditionalData] = React.useState<Record<string, any>[]>();
    const [dataLoading, setDataLoading] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();

    const [open, setOpen] = React.useState(false);

    useEffect(() => {

        if (!open) return;

        setDataLoading(true);

        const updateEntities = async (entities: Entity<S, Key>[]) => {
            setData(entities);
            await fetchAdditionalColumns(entities);
            setDataLoading(false);
            setDataLoadingError(undefined);
        };

        const fetchAdditionalColumns = async (entities: Entity<S, Key>[]) => {

            if (!exportConfig?.additionalColumns) {
                return;
            }

            const additionalColumns = exportConfig.additionalColumns;

            const resolvedColumnsValues: Record<string, any>[] = await Promise.all(entities.map(async (entity) => {
                return (await Promise.all(additionalColumns.map(async (column) => {
                    return { [column.key]: await column.builder({ entity }) };
                }))).reduce((a, b) => ({ ...a, ...b }), {});
            }));

            setAdditionalData(resolvedColumnsValues);
        };

        const onFetchError = (error: Error) => {
            console.error("ERROR", error);
            setDataLoading(false);
            setDataLoadingError(error);
        };

        return listenCollection<S, Key>(
            collectionPath,
            schema,
            updateEntities,
            onFetchError,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined);

    }, [collectionPath, schema, open]);

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
    const exportableData: any[] | undefined = data && data.map(e => ({ id: e.id, ...processProperties(e.values as any, properties) }));
    if (exportableData && additionalData) {
        additionalData.map((additional, index) => exportableData[index] = { ...exportableData[index], ...additional });
    }

    const headers = getExportHeaders(properties, exportConfig);

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

function getExportHeaders(properties: Properties,
                          exportConfig?: ExportConfig): Header[] {
    const headers = [
        { label: "id", key: "id" },
        ...Object.entries(properties)
            .map(([childKey, propertyOrBuilder]) => {
                const property = buildPropertyFrom(propertyOrBuilder, {}, undefined);
                return getHeaders(property, childKey, "");
            })
            .flat()
    ];

    if (exportConfig?.additionalColumns) {
        headers.push(...exportConfig.additionalColumns.map((column) => ({
            label: column.key,
            key: column.key
        })));
    }

    return headers;
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

