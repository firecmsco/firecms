import React, { useEffect } from "react";
import {
    buildPropertyFrom,
    Entity,
    EntitySchema,
    ExportConfig,
    Properties,
    Property
} from "../../models";
import {
    computeSchemaProperties,
    fetchCollection
} from "../../models/firestore";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip
} from "@material-ui/core";
import firebase from "firebase/app";
import "firebase/firestore";
import GetAppIcon from "@material-ui/icons/GetApp";
import MuiAlert from "@material-ui/lab/Alert/Alert";
import { CSVLink } from "react-csv";

type ExportButtonProps<S extends EntitySchema<any> > = {
    schema: S;
    collectionPath: string;
    exportConfig?: ExportConfig;
}

const INITIAL_DOCUMENTS_LIMIT = 200;

export default function ExportButton<S extends EntitySchema<any>>({
                                                                                          schema,
                                                                                          collectionPath,
                                                                                          exportConfig
                                                                                      }: ExportButtonProps<S>
) {


    const csvLinkEl = React.useRef<any>(null);

    const [data, setData] = React.useState<Entity<S, any>[]>();
    const [additionalData, setAdditionalData] = React.useState<Record<string, any>[]>();
    const [dataLoading, setDataLoading] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();

    // If in the initial load, we get more than INITIAL_DOCUMENTS_LIMIT results
    const [hasLargeAmountOfData, setHasLargeAmountOfData] = React.useState<boolean>(false);

    // did the user agree to export a large amount of data
    const [fetchLargeDataAccepted, setFetchLargeDataAccepted] = React.useState<boolean>(false);

    const [open, setOpen] = React.useState(false);

    useEffect(() => {

        if (!open) return;

        setDataLoading(true);

        const updateEntities = async (entities: Entity<S, any>[]) => {
            if (entities.length >= INITIAL_DOCUMENTS_LIMIT) {
                setHasLargeAmountOfData(true);
            }
            setData(entities);
            await fetchAdditionalColumns(entities);
            setDataLoading(false);
            setDataLoadingError(undefined);

            // this is hack used to trigger the CSV download after
            // fetching additional data
            if (data && entities.length > data.length && fetchLargeDataAccepted && csvLinkEl.current)
                setTimeout(() => {
                    csvLinkEl.current.link.click();
                });
        };

        const fetchAdditionalColumns = async (entities: Entity<S, any>[]) => {

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

        fetchCollection<S, any>(
            collectionPath,
            schema,
            undefined,
            fetchLargeDataAccepted ? undefined : INITIAL_DOCUMENTS_LIMIT,
            undefined,
            undefined,
            undefined)
            .then(updateEntities)
            .catch(onFetchError);

    }, [collectionPath, fetchLargeDataAccepted, schema, open]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const properties = computeSchemaProperties(schema, collectionPath);
    const exportableData: any[] | undefined = data && data.map(e => ({ id: e.id, ...processProperties(e.values as any, properties) }));
    if (exportableData && additionalData) {
        additionalData.forEach((additional, index) => exportableData[index] = { ...exportableData[index], ...additional });
    }

    const headers = getExportHeaders(properties, collectionPath, exportConfig);

    const needsToAcceptFetchAllData = hasLargeAmountOfData && !fetchLargeDataAccepted;

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

                        <div>Download the the content of this table as a CSV
                        </div>
                        <br/>

                        {needsToAcceptFetchAllData
                        &&
                        <MuiAlert elevation={1}
                                  variant="filled"
                                  severity={"warning"}>
                            <div>
                                This collections has a large number
                                of documents (more
                                than {INITIAL_DOCUMENTS_LIMIT}).
                            </div>
                            <div>
                                Would you like to proceed?
                            </div>

                        </MuiAlert>}

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
                             ref={csvLinkEl}
                             filename={schema.name}
                             style={{
                                 textDecoration: "none"
                             }}
                             asyncOnClick={true}
                             onClick={(event, done) => {
                                 if (needsToAcceptFetchAllData) {
                                     setFetchLargeDataAccepted(true);
                                     done(false);
                                 } else {
                                     handleClose();
                                     done(true);
                                 }
                             }}
                             target="_blank"
                    >
                        <Button color="primary">
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
                          collectionPath: string,
                          exportConfig?: ExportConfig): Header[] {
    const headers = [
        { label: "id", key: "id" },
        ...Object.entries(properties)
            .map(([childKey, propertyOrBuilder]) => {
                const property = buildPropertyFrom(propertyOrBuilder, {}, collectionPath, undefined);
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
(inputValues: Record<Key, any>, properties: P): Record<Key, any> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues as any)[key];
            const updatedValue = processProperty(inputValue, property as Property);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as Record<Key, any>;
    return { ...inputValues, ...updatedValues };
}

