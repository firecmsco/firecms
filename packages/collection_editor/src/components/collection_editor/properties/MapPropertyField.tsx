import React, { useCallback, useState } from "react";
import {
    AddIcon,
    BooleanSwitchWithLabel,
    Button,
    PropertyConfig,
    MapProperty,
    Paper,
    Property,
    Typography
} from "@firecms/core";
import { PropertyFormDialog } from "../PropertyEditView";
import { getIn, useFormikContext } from "formik";
import { PropertyTree } from "../PropertyTree";
import { getFullId, idToPropertiesPath, namespaceToPropertiesOrderPath, namespaceToPropertiesPath } from "../util";
import { FieldHelperView } from "./FieldHelperView";

export function MapPropertyField({ disabled, getData, allowDataInference, customFields }: {
    disabled: boolean;
    getData?: () => Promise<object[]>;
    allowDataInference: boolean;
    customFields: Record<string, PropertyConfig>
}) {

    const {
        values,
        setFieldValue
    } = useFormikContext<MapProperty>();

    const [propertyDialogOpen, setPropertyDialogOpen] = useState<boolean>(false);
    const [selectedPropertyKey, setSelectedPropertyKey] = useState<string | undefined>();
    const [selectedPropertyNamespace, setSelectedPropertyNamespace] = useState<string | undefined>();

    const propertiesOrder = values.propertiesOrder ?? Object.keys(values.properties ?? {});
    const onPropertyCreated = useCallback(({
                                               id,
                                               property
                                           }: { id?: string, property: Property }) => {
        if (!id)
            throw Error();
        setFieldValue("properties", {
            ...(values.properties ?? {}),
            [id]: property
        }, false);
        setFieldValue("propertiesOrder", [...propertiesOrder, id], false);
        setPropertyDialogOpen(false);
    }, [values.properties, propertiesOrder]);

    const deleteProperty = useCallback((propertyKey?: string, namespace?: string) => {
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
    }, [setFieldValue, values]);

    const selectedPropertyFullId = selectedPropertyKey ? getFullId(selectedPropertyKey, selectedPropertyNamespace) : undefined;
    const selectedProperty = selectedPropertyFullId ? getIn(values.properties, selectedPropertyFullId.replaceAll(".", ".properties.")) : undefined;

    const addChildButton = <Button
        color="primary"
        variant={"outlined"}
        onClick={() => setPropertyDialogOpen(true)}
        startIcon={<AddIcon/>}
    >
        Add property to {values.name ?? "this group"}
    </Button>;

    const empty = !propertiesOrder || propertiesOrder.length < 1;

    const onPropertyMove = useCallback((propertiesOrder: string[], namespace?: string) => {
        setFieldValue(namespaceToPropertiesOrderPath(namespace), propertiesOrder, false);
    }, []);

    return (
        <>
            <div className={"col-span-12"}>
                <div className="flex justify-between items-end my-4">
                    <Typography variant={"subtitle2"}>Properties in this group</Typography>
                    {addChildButton}
                </div>
                <Paper className="p-2 pl-8">
                    <PropertyTree
                        properties={values.properties ?? {}}
                        propertiesOrder={propertiesOrder}
                        errors={{}}
                        onPropertyClick={(propertyKey, namespace) => {
                            setSelectedPropertyKey(propertyKey);
                            setSelectedPropertyNamespace(namespace);
                            setPropertyDialogOpen(true);
                        }}
                        onPropertyMove={onPropertyMove}/>

                    {empty &&
                        <Typography variant={"label"}
                                    className="h-full flex items-center justify-center p-2">
                            Add the first property to this group
                        </Typography>}
                </Paper>
            </div>

            <div className={"col-span-12"}>
                <BooleanSwitchWithLabel
                    position={"start"}
                    size={"small"}
                    label="Spread children as columns"
                    onValueChange={(v) => setFieldValue("spreadChildren", v)}
                    value={values.spreadChildren ?? false}
                />
                <FieldHelperView>
                    Set this flag to true if you want to display the children of this group as individual columns.
                </FieldHelperView>
            </div>

            <PropertyFormDialog
                inArray={false}
                forceShowErrors={false}
                open={propertyDialogOpen}
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
                customFields={customFields}
            />

        </>);
}
