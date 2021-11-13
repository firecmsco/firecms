import React, { useEffect } from "react";
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
} from "@mui/material";

import GetAppIcon from "@mui/icons-material/GetApp";
import MuiAlert from "@mui/lab/Alert/Alert";
import { CSVLink } from "react-csv";
import {
    Entity,
    EntityReference,
    EntitySchema,
    ExportConfig,
    Properties,
    Property
} from "../../../../models";
import { computeSchemaProperties } from "../../../utils";
import { useDataSource, useFireCMSContext } from "../../../../hooks";
import { buildPropertyFrom } from "../../../util/property_builder";

interface ExportButtonProps<M extends { [Key: string]: any }, UserType> {
    schema: EntitySchema<M>;
    path: string;
    exportConfig?: ExportConfig<UserType>;
}

const INITIAL_DOCUMENTS_LIMIT = 200;

export function ExportButton<M extends { [Key: string]: any }, UserType>({
                                                                   schema,
                                                                   path,
                                                                   exportConfig
                                                               }: ExportButtonProps<M, UserType>
) {


    const dataSource = useDataSource();
    const context = useFireCMSContext();
    const csvLinkEl = React.useRef<any>(null);

    const [data, setData] = React.useState<Entity<M>[]>();
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

        const updateEntities = async (entities: Entity<M>[]) => {
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

        const fetchAdditionalColumns = async (entities: Entity<M>[]) => {

            if (!exportConfig?.additionalColumns) {
                return;
            }

            const additionalColumns = exportConfig.additionalColumns;

            const resolvedColumnsValues: Record<string, any>[] = await Promise.all(entities.map(async (entity) => {
                return (await Promise.all(additionalColumns.map(async (column) => {
                    return { [column.key]: await column.builder({ entity, context }) };
                }))).reduce((a, b) => ({ ...a, ...b }), {});
            }));

            setAdditionalData(resolvedColumnsValues);
        };

        const onFetchError = (error: Error) => {
            console.error("ERROR", error);
            setDataLoading(false);
            setDataLoadingError(error);
        };

        dataSource.fetchCollection<M>({
            path,
            schema,
            limit: fetchLargeDataAccepted ? undefined : INITIAL_DOCUMENTS_LIMIT
        })
            .then(updateEntities)
            .catch(onFetchError);

    }, [path, fetchLargeDataAccepted, schema, open]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const properties = computeSchemaProperties(schema, path);
    const exportableData: any[] | undefined = data && data.map(e => ({ id: e.id, ...processProperties(e.values as any, properties) }));
    if (exportableData && additionalData) {
        additionalData.forEach((additional, index) => exportableData[index] = { ...exportableData[index], ...additional });
    }

    const headers = getExportHeaders(properties, path, exportConfig);

    const needsToAcceptFetchAllData = hasLargeAmountOfData && !fetchLargeDataAccepted;

    return <>

        <Tooltip title={"Export"}>
            <IconButton color={"primary"} onClick={handleClickOpen}
                        size="large">
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

    </>;
}

interface Header {
    label: string,
    key: string
}

function getExportHeaders<M extends { [Key: string]: any}, UserType>(properties: Properties<M>,
                                                            path: string,
                                                            exportConfig?: ExportConfig<UserType>): Header[] {
    const headers = [
        { label: "id", key: "id" },
        ...Object.entries(properties)
            .map(([childKey, propertyOrBuilder]) => {
                const property = buildPropertyFrom(propertyOrBuilder, {}, path, undefined);
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
        value = processProperties(inputValue, property.properties as Properties<any>);
    } else if (property.dataType === "array") {
        if (property.of && Array.isArray(inputValue)) {
            value = inputValue.map((e) => processProperty(e, property.of as Property));
        } else {
            value = inputValue;
        }
    } else if (property.dataType === "reference") {
        const ref = inputValue ? inputValue as EntityReference : undefined;
        value = ref ? ref.path : null;
    } else if (property.dataType === "timestamp") {
        value = inputValue ? inputValue.getTime() : null;
    } else {
        value = inputValue;
    }

    return value;
}

function processProperties<M extends { [Key: string]: any }>
(inputValues: Record<keyof M, any>, properties: Properties<M>): Record<keyof M, any> {
    const updatedValues = Object.entries(properties)
        .map(([key, property]) => {
            const inputValue = inputValues && (inputValues as any)[key];
            const updatedValue = processProperty(inputValue, property as Property);
            if (updatedValue === undefined) return {};
            return ({ [key]: updatedValue });
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as Record<keyof M, any>;
    return { ...inputValues, ...updatedValues };
}

