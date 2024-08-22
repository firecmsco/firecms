import React, { useCallback, useEffect } from "react";
import {
    CollectionActionsProps,
    EntityCollectionTable,
    getFieldConfig,
    getPropertiesWithPropertiesOrder,
    getPropertyInPath,
    PropertiesOrBuilders,
    Property,
    PropertyConfigBadge,
    resolveCollection,
    ResolvedProperties,
    slugify,
    useCustomizationController,
    User,
    useSelectionController,
    useSnackbarController
} from "@firecms/core";
import {
    Button,
    cls,
    defaultBorderMixin,
    Dialog,
    DialogActions,
    DialogContent,
    FileUploadIcon,
    IconButton,
    Select,
    SelectItem,
    Tooltip,
    Typography,
} from "@firecms/ui";
import { buildEntityPropertiesFromData } from "@firecms/schema_inference";
import { useImportConfig } from "../hooks";
import { convertDataToEntity, getInferenceType } from "../utils";
import { DataNewPropertiesMapping, ImportFileUpload, ImportSaveInProgress } from "../components";
import { ImportConfig } from "../types";

type ImportState = "initial" | "mapping" | "preview" | "import_data_saving";

export function ImportCollectionAction<M extends Record<string, any>, UserType extends User>({
                                                                                                 collection,
                                                                                                 path,
                                                                                                 onAnalyticsEvent
                                                                                             }: CollectionActionsProps<M, UserType> & {
                                                                                                 onAnalyticsEvent?: (event: string, params?: any) => void;
                                                                                             }
) {

    const customizationController = useCustomizationController();

    const snackbarController = useSnackbarController();

    const [open, setOpen] = React.useState(false);

    const [step, setStep] = React.useState<ImportState>("initial");

    const importConfig = useImportConfig();

    const handleClickOpen = useCallback(() => {
        setOpen(true);
        onAnalyticsEvent?.("import_open");
        setStep("initial");
    }, [onAnalyticsEvent]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const onMappingComplete = useCallback(() => {
        onAnalyticsEvent?.("import_mapping_complete");
        setStep("preview");
    }, [onAnalyticsEvent]);

    const onPreviewComplete = useCallback(() => {
        onAnalyticsEvent?.("import_data_save");
        setStep("import_data_saving");
    }, [onAnalyticsEvent]);

    const onDataAdded = async (data: object[]) => {
        importConfig.setImportData(data);

        if (data.length > 0) {
            const originProperties = await buildEntityPropertiesFromData(data, getInferenceType);
            importConfig.setOriginProperties(originProperties);

            const headersMapping = buildHeadersMappingFromData(data, collection?.properties);
            importConfig.setHeadersMapping(headersMapping);
            const firstKey = Object.keys(headersMapping)?.[0];
            if (firstKey?.includes("id") || firstKey?.includes("key")) {
                importConfig.setIdColumn(firstKey);
            }
        }
        setTimeout(() => {
            onAnalyticsEvent?.("import_data_added");
            setStep("mapping");
        }, 100);
        // setStep("mapping");
    };

    const resolvedCollection = resolveCollection({
        collection,
        path,
        fields: customizationController.propertyConfigs
    });

    const properties = getPropertiesWithPropertiesOrder<M>(resolvedCollection.properties, resolvedCollection.propertiesOrder as Extract<keyof M, string>[]) as ResolvedProperties<M>;

    const propertiesAndLevel = Object.entries(properties)
        .flatMap(([key, property]) => getPropertiesAndLevel(key, property, 0));
    const propertiesOrder = (resolvedCollection.propertiesOrder ?? Object.keys(resolvedCollection.properties)) as Extract<keyof M, string>[];
    if (collection.collectionGroup) {
        return null;
    }

    return <>

        <Tooltip title={"Import"}
                 asChild={true}>
            <IconButton color={"primary"} onClick={handleClickOpen}>
                <FileUploadIcon/>
            </IconButton>
        </Tooltip>

        <Dialog open={open}
                fullWidth={step === "preview"}
                fullHeight={step === "preview"}
                maxWidth={step === "initial" ? "lg" : "7xl"}>
            <DialogContent className={"flex flex-col gap-4 my-4"} fullHeight={step === "preview"}>

                {step === "initial" && <>
                    <Typography variant={"h6"}>Import data</Typography>
                    <Typography variant={"body2"}>Upload a CSV, Excel or JSON file and map it to your existing
                        schema</Typography>
                    <ImportFileUpload onDataAdded={onDataAdded}/>
                </>}

                {step === "mapping" && <>
                    <Typography variant={"h6"} className={"ml-3.5"}>Map fields</Typography>
                    <DataNewPropertiesMapping importConfig={importConfig}
                                              destinationProperties={properties}
                                              buildPropertyView={({
                                                                      isIdColumn,
                                                                      property,
                                                                      propertyKey,
                                                                      importKey,
                                                                  }) => {
                                                  return <PropertyTreeSelect
                                                      selectedPropertyKey={propertyKey ?? ""}
                                                      properties={properties}
                                                      propertiesAndLevel={propertiesAndLevel}
                                                      isIdColumn={isIdColumn}
                                                      onIdSelected={() => {
                                                          importConfig.setIdColumn(importKey);
                                                      }}
                                                      onPropertySelected={(newPropertyKey) => {

                                                          onAnalyticsEvent?.("import_mapping_field_updated");
                                                          const newHeadersMapping: Record<string, string | null> = Object.entries(importConfig.headersMapping)
                                                              .map(([currentImportKey, currentPropertyKey]) => {
                                                                  if (currentPropertyKey === newPropertyKey) {
                                                                      return { [currentImportKey]: null };
                                                                  }
                                                                  if (currentImportKey === importKey) {
                                                                      return { [currentImportKey]: newPropertyKey };
                                                                  }
                                                                  return { [currentImportKey]: currentPropertyKey };
                                                              })
                                                              .reduce((acc, curr) => ({ ...acc, ...curr }), {});
                                                          importConfig.setHeadersMapping(newHeadersMapping as Record<string, string>);

                                                          if (newPropertyKey === importConfig.idColumn) {
                                                              importConfig.setIdColumn(undefined);
                                                          }

                                                      }}
                                                  />;
                                              }}/>
                </>}

                {step === "preview" && <ImportDataPreview importConfig={importConfig}
                                                          properties={properties}
                                                          propertiesOrder={propertiesOrder}/>}

                {step === "import_data_saving" && importConfig &&
                    <ImportSaveInProgress importConfig={importConfig}
                                          collection={collection}
                                          path={path}
                                          onImportSuccess={(importedCollection) => {
                                              handleClose();
                                              snackbarController.open({
                                                  type: "info",
                                                  message: "Data imported successfully"
                                              });
                                          }}
                    />}

            </DialogContent>
            <DialogActions>

                {step === "mapping" && <Button onClick={() => setStep("initial")}
                                               variant={"text"}>
                    Back
                </Button>}

                {step === "preview" && <Button onClick={() => setStep("mapping")}
                                               variant={"text"}>
                    Back
                </Button>}

                <Button onClick={handleClose}
                        variant={"text"}>
                    Cancel
                </Button>

                {step === "mapping" && <Button variant="filled"
                                               onClick={onMappingComplete}>
                    Next
                </Button>}

                {step === "preview" && <Button variant="filled"
                                               onClick={onPreviewComplete}>
                    Save data
                </Button>}

            </DialogActions>
        </Dialog>

    </>;
}

const internalIDValue = "__internal_id__";

function PropertyTreeSelect({
                                selectedPropertyKey,
                                properties,
                                onPropertySelected,
                                onIdSelected,
                                propertiesAndLevel,
                                isIdColumn
                            }: {
    selectedPropertyKey: string | null;
    properties: Record<string, Property>;
    onPropertySelected: (propertyKey: string | null) => void;
    onIdSelected: () => void;
    propertiesAndLevel: PropertyAndLevel[];
    isIdColumn?: boolean;
}) {

    const selectedProperty = selectedPropertyKey ? getPropertyInPath(properties, selectedPropertyKey) : null;

    const renderValue = useCallback((selectedPropertyKey: string) => {

        if (selectedPropertyKey === internalIDValue) {
            return <Typography variant={"body2"} className={"p-4"}>Use this column as ID</Typography>;
        }

        if (!selectedPropertyKey || !selectedProperty) {
            return <Typography variant={"body2"} color="disabled" className={"p-4"}>Do not import this
                property</Typography>;
        }

        return <PropertySelectEntry propertyKey={selectedPropertyKey}
                                    property={selectedProperty as Property}/>;
    }, [selectedProperty]);

    const onSelectValueChange = (value: string) => {
        if (value === internalIDValue) {
            onIdSelected();
            onPropertySelected(null);
        } else if (value === "__do_not_import") {
            onPropertySelected(null);
        } else {
            onPropertySelected(value);
        }
    };

    return <Select value={isIdColumn ? internalIDValue : (selectedPropertyKey ?? undefined)}
                   onValueChange={onSelectValueChange}
                   renderValue={renderValue}>

        <SelectItem value={"__do_not_import"}>
            <Typography variant={"body2"} color={"disabled"} className={"p-4"}>Do not import this property</Typography>
        </SelectItem>

        <SelectItem value={internalIDValue}>
            <Typography variant={"body2"} className={"p-4"}>Use this column as ID</Typography>
        </SelectItem>

        {propertiesAndLevel.map(({
                                     property,
                                     level,
                                     propertyKey
                                 }) => {
            return <SelectItem value={propertyKey}
                               key={propertyKey}
                               disabled={property.dataType === "map"}>
                <PropertySelectEntry propertyKey={propertyKey}
                                     property={property}
                                     level={level}/>
            </SelectItem>;
        })}

    </Select>;
}

type PropertyAndLevel = {
    property: Property,
    level: number,
    propertyKey: string
};

function getPropertiesAndLevel(key: string, property: Property, level: number): PropertyAndLevel[] {
    const properties: PropertyAndLevel[] = [];
    properties.push({
        property,
        level,
        propertyKey: key
    });
    if (property.dataType === "map" && property.properties) {
        Object.entries(property.properties).forEach(([childKey, value]) => {
            properties.push(...getPropertiesAndLevel(`${key}.${childKey}`, value as Property, level + 1));
        });
    }
    return properties;
}

export function PropertySelectEntry({
                                        propertyKey,
                                        property,
                                        level = 0
                                    }: {
    propertyKey: string;
    property: Property;
    level?: number;
}) {

    const { propertyConfigs } = useCustomizationController();
    const widget = getFieldConfig(property, propertyConfigs);

    return <div
        className="flex flex-row w-full text-start items-center h-full">

        {new Array(level).fill(0).map((_, index) =>
            <div className={cls(defaultBorderMixin, "ml-8 border-l h-12")} key={index}/>)}

        <div className={"m-4"}>
            <Tooltip title={widget?.name}>
                <PropertyConfigBadge propertyConfig={widget}/>
            </Tooltip>
        </div>

        <div className={"flex flex-col flex-grow p-2 pl-2"}>
            <Typography variant="body1"
                        component="span"
                        className="flex-grow pr-2">
                {property.name
                    ? property.name
                    : "\u00a0"
                }
            </Typography>

            <Typography className=" pr-2"
                        variant={"body2"}
                        component="span"
                        color="secondary">
                {propertyKey}
            </Typography>
        </div>

    </div>;

}

export function ImportDataPreview<M extends Record<string, any>>({
                                                                     importConfig,
                                                                     properties,
                                                                     propertiesOrder
                                                                 }: {
    importConfig: ImportConfig,
    properties: ResolvedProperties<M>,
    propertiesOrder: Extract<keyof M, string>[],
}) {

    useEffect(() => {
        const mappedData = importConfig.importData.map(d => convertDataToEntity(d, importConfig.idColumn, importConfig.headersMapping, properties, "TEMP_PATH", importConfig.defaultValues));
        importConfig.setEntities(mappedData);
    }, []);

    const selectionController = useSelectionController();

    return <EntityCollectionTable
        title={<div>
            <Typography variant={"subtitle2"}>Imported data preview</Typography>
            <Typography variant={"caption"}>Entities with the same id will be overwritten</Typography>
        </div>}
        tableController={{
            data: importConfig.entities,
            dataLoading: false,
            noMoreToLoad: false
        }}
        enablePopupIcon={false}
        endAdornment={<div className={"h-12"}/>}
        filterable={false}
        sortable={false}
        selectionController={selectionController}
        properties={properties}/>

}

function buildHeadersMappingFromData(objArr: object[], properties?: PropertiesOrBuilders<any>) {
    const headersMapping: Record<string, string> = {};
    objArr.filter(Boolean).forEach((obj) => {
        Object.keys(obj).forEach((key) => {
            // @ts-ignore
            const child = obj[key];
            if (typeof child === "object" && !Array.isArray(child)) {
                const childProperty = properties?.[key];
                const childProperties = childProperty && "properties" in childProperty ? childProperty.properties : undefined;
                const childHeadersMapping = buildHeadersMappingFromData([child], childProperties);
                Object.entries(childHeadersMapping).forEach(([subKey, mapping]) => {
                    headersMapping[`${key}.${subKey}`] = `${key}.${mapping}`;
                });
            }

            if (!properties) {
                headersMapping[key] = key;
            } else if (key in properties) {
                headersMapping[key] = key;
            } else {
                const slug = slugify(key);
                if (slug in properties) {
                    headersMapping[key] = slug;
                } else {
                    headersMapping[key] = key;
                }
            }

        });
    });
    return headersMapping;
}
