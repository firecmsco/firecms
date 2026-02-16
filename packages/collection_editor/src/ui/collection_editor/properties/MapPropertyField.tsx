import React, { useState } from "react";
import { FieldCaption, MapProperty, Property, PropertyConfig, } from "@firecms/core";
import { AddIcon, BooleanSwitchWithLabel, Button, Paper, Typography } from "@firecms/ui";
import { PropertyFormDialog } from "../PropertyEditView";
import { getIn, useFormex } from "@firecms/formex";
import { PropertyTree } from "../PropertyTree";
import { getFullId, idToPropertiesPath, namespaceToPropertiesOrderPath, namespaceToPropertiesPath } from "../util";

export function MapPropertyField({ disabled, getData, allowDataInference, propertyConfigs, collectionEditable }: {
    disabled: boolean;
    getData?: () => Promise<object[]>;
    allowDataInference: boolean;
    propertyConfigs: Record<string, PropertyConfig>,
    collectionEditable: boolean;
}) {

    const {
        values,
        setFieldValue
    } = useFormex<MapProperty>();

    const [propertyDialogOpen, setPropertyDialogOpen] = useState<boolean>(false);
    const [selectedPropertyKey, setSelectedPropertyKey] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();

    const propertiesOrder = values.propertiesOrder ?? Object.keys(values.properties ?? {});
    const onPropertyCreated = ({
                                   id,
                                   property
                               }: { id?: string, property: Property }) => {
        if (!id)
            throw Error();
        setFieldValue("properties", {
            ...(values.properties ?? {}),
            [id]: property
        }, false);

        const currentPropertiesOrder = values.propertiesOrder ?? Object.keys(values.properties ?? {});
        const newPropertiesOrder = currentPropertiesOrder.includes(id) ? currentPropertiesOrder : [...currentPropertiesOrder, id];
        setFieldValue("propertiesOrder", newPropertiesOrder, false);

        setPropertyDialogOpen(false);
    };

    const deleteProperty = (propertyKey?: string, namespace?: string) => {
        const fullId = propertyKey ? getFullId(propertyKey, namespace) : undefined;
        if (!fullId)
            throw Error("collection editor miss config");

        const propertiesPath = idToPropertiesPath(fullId);
        const propertiesOrderPath = namespaceToPropertiesOrderPath(namespace);

        const currentPropertiesOrder: string[] = getIn(values, propertiesOrderPath) ?? Object.keys(getIn(values, namespaceToPropertiesPath(namespace)));

        setFieldValue(propertiesPath, undefined, false);
        setFieldValue(propertiesOrderPath, currentPropertiesOrder.filter((p) => p !== propertyKey), false);

        setPropertyDialogOpen(false);
        setSelectedPropertyKey(undefined);
        setSelectedPropertyNamespace(undefined);
    };

    const selectedPropertyFullId = selectedPropertyKey ? getFullId(selectedPropertyKey, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const empty = !propertiesOrder || propertiesOrder.length < 1;

    const onPropertyMove = (propertiesOrder: string[], namespace?: string) => {
        setFieldValue(namespaceToPropertiesOrderPath(namespace), propertiesOrder, false);
    };

    return (
        <>
            <div className={"col-span-12"}>
                <div className="flex justify-between items-end my-4">
                    <Typography variant={"subtitle2"}>Properties in this group</Typography>
                    <Button
                        onClick={() => setPropertyDialogOpen(true)}
                        startIcon={<AddIcon/>}
                    >
                        Add property to {values.name ?? "this group"}
                    </Button>
                </div>
                <Paper className="p-2 pl-8">
                    <PropertyTree
                        properties={values.properties ?? {}}
                        propertiesOrder={propertiesOrder}
                        errors={{}}
                        collectionEditable={collectionEditable}
                        onPropertyClick={(propertyKey, namespace) => {
                            setSelectedPropertyKey(propertyKey);
                            setSelectedPropertyNamespace(namespace);
                            setPropertyDialogOpen(true);
                        }}
                        onPropertyMove={onPropertyMove}/>

                    {empty &&
                        <Typography variant={"label"}
                                    className="h-full flex items-center justify-center p-4">
                            Add the first property to this group
                        </Typography>}
                </Paper>
            </div>

            <div className={"col-span-12"}>
                <BooleanSwitchWithLabel
                    position={"start"}
                    size={"medium"}
                    label="Spread children as columns"
                    onValueChange={(v) => setFieldValue("spreadChildren", v)}
                    value={values.spreadChildren ?? false}
                />
                <FieldCaption>
                    Set this flag to true if you want to display the children of this group as individual columns. This
                    will only work for top level groups.
                </FieldCaption>
            </div>

            <PropertyFormDialog
                inArray={false}
                forceShowErrors={false}
                open={propertyDialogOpen}
                allowDataInference={allowDataInference}
                collectionEditable={collectionEditable}
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
                getData={getData}
                onDelete={deleteProperty}
                propertyKey={selectedPropertyKey}
                propertyNamespace={selectedPropertyNamespace}
                property={selectedProperty}
                existingProperty={Boolean(selectedPropertyKey)}
                autoUpdateId={!selectedPropertyKey}
                autoOpenTypeSelect={!selectedPropertyKey}
                onPropertyChanged={onPropertyCreated}
                existingPropertyKeys={selectedPropertyKey ? undefined : propertiesOrder}
                propertyConfigs={propertyConfigs}
            />

        </>);
}
