import {
    DataNewPropertiesMapping,
    getInferenceType,
    ImportConfig,
    ImportNewPropertyFieldPreview
} from "@firecms/data_import_export";
import { getIn, useFormikContext } from "formik";

import { FieldConfigBadge, getFieldConfig, getFieldId, Properties, Property, PropertyConfig, } from "@firecms/core";
import { Container, Select, Tooltip, Typography } from "@firecms/ui";
import React, { useState } from "react";
import { OnPropertyChangedParams, PropertyFormDialog, PropertyWithId } from "../PropertyEditView";
import { getFullId, idToPropertiesPath, namespaceToPropertiesOrderPath } from "../util";
import { PersistedCollection } from "../../../types/persisted_collection";
import { updatePropertyFromWidget } from "../utils/update_property_for_widget";
import { PropertySelectItem } from "../PropertySelectItem";
import { supportedFields } from "../utils/supported_fields";
import { buildPropertyFromData } from "@firecms/schema_inference";

export function CollectionEditorImportMapping({
                                                  importConfig,
                                                  propertyConfigs,
                                                  collectionEditable
                                              }:
                                                  {
                                                      importConfig: ImportConfig,
                                                      propertyConfigs: Record<string, PropertyConfig>,
                                                      collectionEditable: boolean
                                                  }) {

    const {
        setFieldValue,
        setFieldTouched,
        values
    } = useFormikContext<PersistedCollection>();
    const [selectedProperty, setSelectedProperty] = useState<PropertyWithId | undefined>(undefined);

    const currentPropertiesOrderRef = React.useRef<{
        [key: string]: string[]
    }>(values.propertiesOrder ? { "": values.propertiesOrder } : {});

    const propertyKey = selectedProperty ? selectedProperty.id : undefined;
    const property = selectedProperty || undefined;

    const onPropertyChanged = ({
                                   id,
                                   property,
                                   previousId,
                                   namespace
                               }: OnPropertyChangedParams) => {

        const fullId = id ? getFullId(id, namespace) : undefined;
        const propertyPath = fullId ? idToPropertiesPath(fullId) : undefined;

        // setSelectedProperty(property);
        const getCurrentPropertiesOrder = (namespace?: string) => {
            if (!namespace) return currentPropertiesOrderRef.current[""];
            return currentPropertiesOrderRef.current[namespace] ?? getIn(values, namespaceToPropertiesOrderPath(namespace));
        }

        const updatePropertiesOrder = (newPropertiesOrder: string[], namespace?: string) => {
            const propertiesOrderPath = namespaceToPropertiesOrderPath(namespace);

            setFieldValue(propertiesOrderPath, newPropertiesOrder, false);
            currentPropertiesOrderRef.current[namespace ?? ""] = newPropertiesOrder;

        };

        // If the id has changed we need to a little cleanup
        if (previousId && previousId !== id) {
            const previousFullId = getFullId(previousId, namespace);
            const previousPropertyPath = idToPropertiesPath(previousFullId);

            const currentPropertiesOrder = getCurrentPropertiesOrder(namespace);

            // replace previousId with id in propertiesOrder
            const newPropertiesOrder = currentPropertiesOrder
                .map((p) => p === previousId ? id : p)
                .filter((p) => p !== undefined) as string[];
            updatePropertiesOrder(newPropertiesOrder, namespace);

            // replace previousId with id in headersMapping
            const newHeadersMapping = { ...importConfig.headersMapping };
            Object.keys(newHeadersMapping).forEach((key) => {
                if (newHeadersMapping[key] === previousId) {
                    newHeadersMapping[key] = id ?? "";
                }
            });
            importConfig.setHeadersMapping(newHeadersMapping);

            // if (id) {
            //     setSelectedPropertyIndex(newPropertiesOrder.indexOf(id));
            //     setSelectedPropertyKey(id);
            // }
            setFieldValue(previousPropertyPath, undefined, false);
            setFieldTouched(previousPropertyPath, false, false);
        }

        if (propertyPath) {
            setFieldValue(propertyPath, property, false);
            setFieldTouched(propertyPath, true, false);
        }
    };
    const onPropertyTypeChanged = async ({
                                             id,
                                             importKey,
                                             property,
                                             namespace
                                         }: OnPropertyChangedParams & {
        importKey: string
    }) => {

        const fullId = id ? getFullId(id, namespace) : undefined;
        const propertyPath = fullId ? idToPropertiesPath(fullId) : undefined;

        // we try to infer the rest of the properties of a property, from the type and the data
        const propertyData = importConfig.importData.map((d) => getIn(d, importKey));
        const inferredNewProperty = {
            ...buildPropertyFromData(propertyData, property, getInferenceType),
            editable: true
        };

        if (propertyPath) {
            if (inferredNewProperty) {
                setFieldValue(propertyPath, inferredNewProperty, false);
            } else {
                setFieldValue(propertyPath, property, false);
            }
            setFieldTouched(propertyPath, true, false);
        }
    };

    return (

        <div className={"overflow-auto my-auto bg-gray-50 dark:bg-gray-900"}>
            <Container maxWidth={"6xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <Typography variant="h6" className={"mt-4"}>Data property mapping</Typography>

                <DataNewPropertiesMapping headersMapping={importConfig.headersMapping}
                                          idColumn={importConfig.idColumn}
                                          originProperties={importConfig.originProperties}
                                          destinationProperties={values.properties as Properties}
                                          onIdPropertyChanged={(value) => importConfig.setIdColumn(value)}
                                          buildPropertyView={({
                                                                  property,
                                                                  propertyKey,
                                                                  importKey
                                                              }) => {
                                              return <ImportNewPropertyFieldPreview
                                                  property={property}
                                                  propertyKey={propertyKey}
                                                  onPropertyNameChanged={(propertyKey: string, value: string) => setFieldValue(`properties.${propertyKey}.name`, value, false)}
                                                  onEditClick={() => {
                                                      if (!propertyKey || !property) return;
                                                      setSelectedProperty({
                                                          ...property,
                                                          id: propertyKey,
                                                          editable: true
                                                      });
                                                  }}
                                                  propertyTypeView={<PropertySelect property={property}
                                                                                    disabled={false}
                                                                                    onPropertyChanged={(props) => onPropertyTypeChanged({
                                                                                        ...props,
                                                                                        importKey
                                                                                    })}
                                                                                    propertyKey={propertyKey}
                                                                                    propertyConfigs={propertyConfigs}/>}
                                              />;
                                          }}/>
            </Container>

            <PropertyFormDialog
                open={selectedProperty !== undefined}
                propertyKey={propertyKey}
                property={property}
                inArray={false}
                autoUpdateId={false}
                onPropertyChanged={onPropertyChanged}
                allowDataInference={false}
                collectionEditable={collectionEditable}
                onOkClicked={() => {
                    setSelectedProperty(undefined);
                }}
                onCancel={() => {
                    setSelectedProperty(undefined);
                }}
                autoOpenTypeSelect={false}
                existingProperty={false}
                propertyConfigs={propertyConfigs}/>

            <div style={{ height: "52px" }}/>
        </div>
    );

}

function PropertySelect({
                            property,
                            onPropertyChanged,
                            propertyKey,
                            propertyConfigs,
                            disabled
                        }: {
    property: Property | null,
    propertyKey: string | null,
    onPropertyChanged: ({
                            id,
                            property,
                            previousId,
                            namespace
                        }: OnPropertyChangedParams) => void,
    propertyConfigs: Record<string, PropertyConfig>,
    disabled?: boolean
}) {

    const fieldId = property ? getFieldId(property) : null;
    const widget = property ? getFieldConfig(property, propertyConfigs) : null;

    const [selectOpen, setSelectOpen] = useState(false);

    return <Tooltip title={property && widget ? `${widget?.name} - ${property.dataType}` : undefined}
                    open={selectOpen ? false : undefined}>
        <Select
            open={selectOpen}
            onOpenChange={setSelectOpen}
            invisible={true}
            className={"w-full"}
            disabled={disabled}
            error={!widget}
            value={fieldId ?? ""}
            placeholder={"Select a property widget"}
            position={"item-aligned"}
            renderValue={(value) => {
                if (!widget) return null;
                return <FieldConfigBadge propertyConfig={widget}/>
            }}
            onValueChange={(newSelectedWidgetId) => {
                const newProperty = updatePropertyFromWidget(property, newSelectedWidgetId, propertyConfigs)
                if (!propertyKey) return;
                onPropertyChanged({
                    id: propertyKey,
                    property: newProperty,
                    previousId: propertyKey,
                    namespace: undefined
                });
            }}>
            {Object.entries(supportedFields).map(([key, widget]) => {
                return <PropertySelectItem
                    key={key}
                    value={key}
                    optionDisabled={false}
                    propertyConfig={widget}
                    existing={false}/>;
            })
            }
        </Select>
    </Tooltip>;
}
