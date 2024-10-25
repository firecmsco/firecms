import React, { useState } from "react";
import { AddIcon, Button, Paper, Typography } from "@firecms/ui";
import { getIn, useFormex } from "@firecms/formex";
import { OnPropertyChangedParams, PropertyFormDialog } from "../PropertyEditView";
import {
    getFullId,
    getFullIdPath,
    idToPropertiesPath,
    namespaceToPropertiesOrderPath,
    namespaceToPropertiesPath
} from "../util";
import { PropertyTree } from "../PropertyTree";
import { ArrayProperty, PropertyConfig } from "@firecms/core";

export function BlockPropertyField({
                                       disabled,
                                       getData,
                                       allowDataInference,
                                       propertyConfigs,
                                       collectionEditable
                                   }: {
    disabled: boolean;
    getData?: () => Promise<object[]>;
    allowDataInference: boolean;
    propertyConfigs: Record<string, PropertyConfig>,
    collectionEditable: boolean;
}) {

    const {
        values,
        setFieldValue
    } = useFormex<ArrayProperty>();

    const [propertyDialogOpen, setPropertyDialogOpen] = useState<boolean>(false);
    const [selectedPropertyKey, setSelectedPropertyKey] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();

    const onPropertyChanged = ({
                                   id,
                                   namespace,
                                   property
                               }: OnPropertyChangedParams) => {
        if (!id)
            throw Error();

        setFieldValue("oneOf." + getFullIdPath(id, namespace), property, false);

        const currentPropertiesOrder = values.oneOf?.propertiesOrder ?? Object.keys(values.oneOf?.properties ?? {});
        const newPropertiesOrder = currentPropertiesOrder.includes(id) ? currentPropertiesOrder : [...currentPropertiesOrder, id];
        setFieldValue("oneOf." + namespaceToPropertiesOrderPath(namespace), newPropertiesOrder, false);
        setPropertyDialogOpen(false);
    };

    const selectedPropertyFullId = selectedPropertyKey ? getFullId(selectedPropertyKey, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.oneOf?.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const deleteProperty = (propertyKey?: string, namespace?: string) => {
        const fullId = propertyKey ? getFullId(propertyKey, namespace) : undefined;
        if (!fullId)
            throw Error("collection editor miss config");

        setFieldValue(`oneOf.${idToPropertiesPath(fullId)}`, undefined, false);
        const propertiesOrderPath = `oneOf.${namespaceToPropertiesOrderPath(namespace)}`;
        const currentPropertiesOrder: string[] = getIn(values, propertiesOrderPath) ?? Object.keys(getIn(values, namespaceToPropertiesPath(namespace)));
        setFieldValue(propertiesOrderPath, currentPropertiesOrder.filter((p) => p !== propertyKey), false);

        setPropertyDialogOpen(false);
        setSelectedPropertyKey(undefined);
        setSelectedPropertyNamespace(undefined);
    };

    const addChildButton = <Button
        autoFocus
        color="primary"

        onClick={() => setPropertyDialogOpen(true)}
        startIcon={<AddIcon/>}
    >
        Add property to {values.name ?? "this block"}
    </Button>;

    const onPropertyMove = (propertiesOrder: string[], namespace?: string) => {
        setFieldValue(`oneOf.${namespaceToPropertiesOrderPath(namespace)}`, propertiesOrder, false);
    };

    return (
        <>
            <div className={"col-span-12"}>
                <div className={"flex justify-between items-end mt-8 mb-4"}>
                    <Typography variant={"subtitle2"}>
                        Properties in this block
                    </Typography>
                    {addChildButton}
                </div>
                <Paper className="p-2 pl-8">

                    <PropertyTree
                        properties={values.oneOf?.properties ?? {}}
                        propertiesOrder={values.oneOf?.propertiesOrder}
                        errors={{}}
                        collectionEditable={collectionEditable}
                        onPropertyClick={disabled
                            ? undefined
                            : (propertyKey, namespace) => {
                                setSelectedPropertyKey(propertyKey);
                                setSelectedPropertyNamespace(namespace);
                                setPropertyDialogOpen(true);
                            }}
                        onPropertyMove={disabled
                            ? undefined
                            : onPropertyMove}/>

                    {!disabled && (values.oneOf?.propertiesOrder?.length === 0)&&
                        <div className="h-full flex items-center justify-center p-4">
                            Add the first property to this block
                        </div>}

                </Paper>
            </div>

            {!disabled && <PropertyFormDialog
                inArray={false}
                forceShowErrors={false}
                open={propertyDialogOpen}
                getData={getData}
                allowDataInference={allowDataInference}
                onCancel={() => {
                    setPropertyDialogOpen(false);
                    setSelectedPropertyKey(undefined);
                    setSelectedPropertyNamespace(undefined);
                }}
                onOkClicked={() => {
                    setPropertyDialogOpen(false);
                    setSelectedPropertyKey(undefined);
                    setSelectedPropertyNamespace(undefined);
                }}
                collectionEditable={collectionEditable}
                onDelete={deleteProperty}
                propertyKey={selectedPropertyKey}
                propertyNamespace={selectedPropertyNamespace}
                property={selectedProperty}
                existingProperty={Boolean(selectedPropertyKey)}
                autoUpdateId={!selectedPropertyKey}
                autoOpenTypeSelect={!selectedPropertyKey}
                onPropertyChanged={onPropertyChanged}
                existingPropertyKeys={selectedPropertyKey ? undefined : values.oneOf?.propertiesOrder}
                propertyConfigs={propertyConfigs}/>}

        </>);
}
