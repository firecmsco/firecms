import React, { useEffect, useMemo, useState } from "react";
import { EntityCollection, FieldCaption, getFieldConfig, IconForView, Property, PropertyConfigBadge, resolveCollection, SearchIconsView, singular, toSnakeCase, unslugify, useAuthController, useCustomizationController } from "@firecms/core";
import {
    BooleanSwitchWithLabel,
    Chip,
    CloseIcon,
    cls,
    Container,
    DebouncedTextField,
    Dialog,
    ExpandablePanel,
    IconButton,
    Select,
    SelectItem,
    SettingsIcon,
    TextField,
    Tooltip,
    Typography,
    useAutoComplete
} from "@firecms/ui";

import { Field, getIn, useFormex } from "@firecms/formex";
import { useCollectionEditorController } from "../../useCollectionEditorController";
import { LayoutModeSwitch } from "./LayoutModeSwitch";
import { ViewModeSwitch } from "./ViewModeSwitch";
import { KanbanConfigSection } from "./KanbanConfigSection";
import { PropertyFormDialog } from "./PropertyEditView";

export function CollectionDetailsForm({
    isNewCollection,
    reservedGroups,
    existingPaths,
    existingIds,
    groups,
    parentCollection,
    children,
    expandKanban
}: {
    isNewCollection: boolean,
    reservedGroups?: string[];
    existingPaths?: string[];
    existingIds?: string[];
    groups: string[] | null;
    parentCollection?: EntityCollection;
    parentCollectionIds?: string[];
    children?: React.ReactNode;
    expandKanban?: boolean;
}) {

    const groupRef = React.useRef<HTMLInputElement>(null);
    const {
        values,
        setFieldValue,
        handleChange,
        touched,
        errors,
        setFieldTouched,
        isSubmitting,
        submitCount
    } = useFormex<EntityCollection>();

    const collectionEditor = useCollectionEditorController();

    const [iconDialogOpen, setIconDialogOpen] = useState(false);
    const [advancedPanelExpanded, setAdvancedPanelExpanded] = useState(false);
    const [orderPropertyDialogOpen, setOrderPropertyDialogOpen] = useState(false);

    const authController = useAuthController();
    const customizationController = useCustomizationController();

    // Resolve collection to get properties for order property select
    const resolvedCollection = useMemo(() => resolveCollection({
        collection: values,
        path: values.path,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [values, customizationController.propertyConfigs, authController]);

    // Get number properties (for orderProperty)
    const numberProperties = useMemo(() => {
        const result: { key: string; label: string; property: Property; }[] = [];
        if (!resolvedCollection.properties) return result;

        Object.entries(resolvedCollection.properties).forEach(([key, prop]) => {
            if (prop && 'dataType' in prop && prop.dataType === 'number') {
                result.push({
                    key,
                    label: (prop as Property).name || key,
                    property: prop as Property
                });
            }
        });
        return result;
    }, [resolvedCollection.properties]);

    const updateDatabaseId = (databaseId: string) => {
        setFieldValue("databaseId", databaseId ?? undefined);
    }

    const updateName = (name: string) => {
        setFieldValue("name", name);

        const pathTouched = getIn(touched, "path");
        if (!pathTouched && isNewCollection && name) {
            setFieldValue("path", toSnakeCase(name));
        }

        const idTouched = getIn(touched, "id");
        if (!idTouched && isNewCollection && name) {
            setFieldValue("id", toSnakeCase(name));
        }

        const singularNameTouched = getIn(touched, "singularName");
        if (!singularNameTouched && isNewCollection && name) {
            setFieldValue("singularName", singular(name));
        }

    };

    useEffect(() => {
        if (errors.id) {
            setAdvancedPanelExpanded(true);
        }
    }, [errors.id]);

    const collectionIcon = <IconForView collectionOrView={values} />;

    const groupOptions = groups?.filter((group) => !reservedGroups?.includes(group));

    const {
        inputFocused,
        autoCompleteOpen,
        setAutoCompleteOpen
    } = useAutoComplete({
        ref: groupRef
    });

    const isSubcollection = !!parentCollection;

    let customIdValue: "true" | "false" | "optional" | "code_defined" | undefined;
    if (typeof values.customId === "object") {
        customIdValue = "code_defined";
    } else if (values.customId === true) {
        customIdValue = "true";
    } else if (values.customId === false) {
        customIdValue = "false";
    } else if (values.customId === "optional") {
        customIdValue = "optional";
    }

    const showErrors = submitCount > 0;

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <div>
                    <div
                        className="flex flex-row gap-2 py-2 pt-3 items-center">
                        <Typography variant={!isNewCollection ? "h5" : "h4"} className={"flex-grow"}>
                            {isNewCollection ? "New collection" : `${values?.name} collection`}
                        </Typography>
                        <DefaultDatabaseField databaseId={values.databaseId}
                            onDatabaseIdUpdate={updateDatabaseId} />

                        <Tooltip title={"Change icon"}
                            asChild={true}>
                            <IconButton
                                shape={"square"}
                                onClick={() => setIconDialogOpen(true)}>
                                {collectionIcon}
                            </IconButton>
                        </Tooltip>
                    </div>

                    {parentCollection && <Chip colorScheme={"tealDarker"}>
                        <Typography variant={"caption"}>
                            This is a subcollection of <b>{parentCollection.name}</b>
                        </Typography>
                    </Chip>}

                </div>
                <div className={"grid grid-cols-12 gap-4"}>

                    <div className={"col-span-12"}>
                        <TextField
                            value={values.name ?? ""}
                            onChange={(e: any) => updateName(e.target.value)}
                            label={"Name"}
                            autoFocus={true}
                            required
                            error={showErrors && Boolean(errors.name)} />
                        <FieldCaption error={touched.name && Boolean(errors.name)}>
                            {touched.name && Boolean(errors.name) ? errors.name : "Name of this collection, usually a plural name (e.g. Products)"}
                        </FieldCaption>
                    </div>

                    <div className={cls("col-span-12 ")}>
                        <Field name={"path"}
                            as={DebouncedTextField}
                            label={"Path"}
                            required
                            error={showErrors && Boolean(errors.path)} />

                        <FieldCaption error={touched.path && Boolean(errors.path)}>
                            {touched.path && Boolean(errors.path)
                                ? errors.path
                                : isSubcollection ? "Relative path to the parent (no need to include the parent path)" : "Path that this collection is stored in, in the database"}
                        </FieldCaption>

                    </div>

                    {/*{!isSubcollection && <div className={"col-span-12 sm:col-span-4 relative"}>*/}

                    {/*    <TextField error={showErrors && Boolean(errors.group)}*/}
                    {/*               disabled={isSubmitting}*/}
                    {/*               value={values.group ?? ""}*/}
                    {/*               autoComplete="off"*/}
                    {/*               onChange={(event) => setFieldValue("group", event.target.value)}*/}
                    {/*               name={"group"}*/}
                    {/*               inputRef={groupRef}*/}
                    {/*               label="Group"/>*/}
                    {/*    <Autocomplete*/}
                    {/*        open={autoCompleteOpen && (groupOptions ?? []).length > 0}*/}
                    {/*        setOpen={setAutoCompleteOpen}>*/}
                    {/*        {groupOptions?.map((group, index) => {*/}
                    {/*            return <AutocompleteItem*/}
                    {/*                key={index + "_" + group}*/}
                    {/*                className={"pr-6 pl-14"}*/}
                    {/*                onClick={() => {*/}
                    {/*                    setAutoCompleteOpen(false);*/}
                    {/*                    setFieldValue("group", group ?? null);*/}
                    {/*                }}*/}
                    {/*            >*/}
                    {/*                <div className={"flex-grow"}>*/}
                    {/*                    {group}*/}
                    {/*                </div>*/}
                    {/*            </AutocompleteItem>;*/}
                    {/*        })}*/}
                    {/*    </Autocomplete>*/}
                    {/*    <FieldCaption>*/}
                    {/*        {showErrors && Boolean(errors.group) ? errors.group : "Group in the home page"}*/}
                    {/*    </FieldCaption>*/}


                    {/*</div>}*/}

                    <LayoutModeSwitch
                        className={"col-span-12"}
                        value={values.openEntityMode ?? "side_panel"}
                        onChange={(value) => setFieldValue("openEntityMode", value)} />

                    <ViewModeSwitch
                        className={"col-span-12"}
                        value={values.defaultViewMode ?? "table"}
                        onChange={(value) => setFieldValue("defaultViewMode", value)} />

                    <KanbanConfigSection className={"col-span-12"} forceExpanded={expandKanban} />

                    <div className={"col-span-12 mt-4"}>
                        {(() => {
                            // Check if orderProperty references a non-existent property
                            const orderPropertyMissing = Boolean(values.orderProperty) &&
                                !numberProperties.some(p => p.key === values.orderProperty);

                            return (
                                <>
                                    <Select
                                        key={`order-select-${numberProperties.length}`}
                                        name="orderProperty"
                                        label="Order Property"
                                        size={"large"}
                                        fullWidth={true}
                                        position={"item-aligned"}
                                        disabled={numberProperties.length === 0}
                                        error={orderPropertyMissing}
                                        value={values.orderProperty ?? ""}
                                        onValueChange={(v) => {
                                            setFieldValue("orderProperty", v || undefined);
                                        }}
                                        renderValue={(value) => {
                                            if (orderPropertyMissing) {
                                                return <span className="text-red-500">{value} (not found)</span>;
                                            }
                                            const prop = numberProperties.find(p => p.key === value);
                                            if (!prop) return "Select a property";
                                            const fieldConfig = getFieldConfig(prop.property, customizationController.propertyConfigs);
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <PropertyConfigBadge propertyConfig={fieldConfig} />
                                                    <span>{prop.label}</span>
                                                </div>
                                            );
                                        }}
                                        endAdornment={values.orderProperty ? (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFieldValue("orderProperty", undefined);
                                                }}
                                            >
                                                <CloseIcon size="small" />
                                            </IconButton>
                                        ) : undefined}
                                    >
                                        {numberProperties.map((prop) => {
                                            const fieldConfig = getFieldConfig(prop.property, customizationController.propertyConfigs);
                                            return (
                                                <SelectItem key={prop.key} value={prop.key}>
                                                    <div className="flex items-center gap-3">
                                                        <PropertyConfigBadge propertyConfig={fieldConfig} />
                                                        <div>
                                                            <div>{prop.label}</div>
                                                            <Typography variant="caption" color="secondary">
                                                                {fieldConfig?.name || "Number"}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </Select>
                                    <FieldCaption error={orderPropertyMissing}>
                                        {orderPropertyMissing
                                            ? `Property "${values.orderProperty}" does not exist or is not a number property. Please select a valid property or clear the selection.`
                                            : numberProperties.length === 0
                                                ? "No number properties found. Add a number property to enable ordering."
                                                : "Select a number property to persist the order of items"
                                        }
                                    </FieldCaption>
                                </>
                            );
                        })()}
                        {(() => {
                            // Check if orderProperty references a non-existent property
                            const orderPropertyMissing = Boolean(values.orderProperty) &&
                                !numberProperties.some(p => p.key === values.orderProperty);
                            const showCreateButton = !values.orderProperty || orderPropertyMissing;

                            // Pre-fill with missing property id or default "__order"
                            const dialogPropertyKey = orderPropertyMissing && values.orderProperty
                                ? values.orderProperty
                                : "__order";
                            const dialogPropertyName = orderPropertyMissing && values.orderProperty
                                ? unslugify(values.orderProperty)
                                : "Order";

                            if (!showCreateButton) return null;

                            return (
                                <>
                                    <button
                                        type="button"
                                        className="ml-3.5 text-sm text-primary hover:text-primary-dark mt-2"
                                        onClick={() => setOrderPropertyDialogOpen(true)}
                                    >
                                        + Create "{dialogPropertyKey}" property
                                    </button>
                                    <PropertyFormDialog
                                        open={orderPropertyDialogOpen}
                                        onCancel={() => setOrderPropertyDialogOpen(false)}
                                        property={{
                                            dataType: "number",
                                            name: dialogPropertyName,
                                            disabled: true,
                                            hideFromCollection: true
                                        }}
                                        propertyKey={dialogPropertyKey}
                                        existingProperty={false}
                                        autoOpenTypeSelect={false}
                                        autoUpdateId={false}
                                        inArray={false}
                                        allowDataInference={false}
                                        propertyConfigs={customizationController.propertyConfigs}
                                        collectionEditable={true}
                                        existingPropertyKeys={Object.keys(values.properties ?? {})}
                                        onPropertyChanged={({ id, property }) => {
                                            const newProperties = {
                                                ...values.properties,
                                                [id!]: property
                                            };
                                            const newPropertiesOrder = [...(values.propertiesOrder ?? Object.keys(values.properties ?? {})), id];
                                            setFieldValue("properties", newProperties);
                                            setFieldValue("propertiesOrder", newPropertiesOrder);
                                            setFieldValue("orderProperty", id);
                                            setOrderPropertyDialogOpen(false);
                                        }}
                                    />
                                </>
                            );
                        })()}
                    </div>

                    <div className={"col-span-12"}>
                        <BooleanSwitchWithLabel
                            position={"start"}
                            size={"large"}
                            allowIndeterminate={true}
                            label={values.history === null || values.history === undefined ? "Document history revisions enabled if enabled globally" : (
                                values.history ? "Document history revisions ENABLED" : "Document history revisions NOT enabled"
                            )}
                            onValueChange={(v) => setFieldValue("history", v)}
                            value={values.history === undefined ? null : values.history}
                        />
                        <FieldCaption>
                            When enabled, each document in this collection will have a history of changes.
                            This is useful for auditing purposes. The data is stored in a subcollection of the document
                            in your database, called <b>__history</b>.
                        </FieldCaption>
                    </div>


                    <div className={"col-span-12 mt-8"}>
                        <ExpandablePanel
                            expanded={advancedPanelExpanded}
                            onExpandedChange={setAdvancedPanelExpanded}
                            title={
                                <div
                                    className="flex flex-row text-surface-500 text-text-secondary dark:text-text-secondary-dark">
                                    <SettingsIcon />
                                    <Typography variant={"subtitle2"}
                                        className="ml-2">
                                        Advanced
                                    </Typography>
                                </div>}
                            initiallyExpanded={false}>
                            <div className={"grid grid-cols-12 gap-4 p-4"}>

                                <div className={"col-span-12"}>
                                    <Field name={"id"}
                                        as={DebouncedTextField}
                                        disabled={!isNewCollection}
                                        label={"Collection id"}
                                        error={showErrors && Boolean(errors.id)} />
                                    <FieldCaption error={touched.id && Boolean(errors.id)}>
                                        {touched.id && Boolean(errors.id) ? errors.id : "This id identifies this collection. Typically the same as the path."}
                                    </FieldCaption>
                                </div>

                                <div className={"col-span-12"}>
                                    <TextField
                                        error={showErrors && Boolean(errors.singularName)}
                                        name={"singularName"}
                                        aria-describedby={"singularName-helper"}
                                        onChange={(e) => {
                                            setFieldTouched("singularName", true);
                                            return handleChange(e);
                                        }}
                                        value={values.singularName ?? ""}
                                        label={"Singular name"} />
                                    <FieldCaption error={showErrors && Boolean(errors.singularName)}>
                                        {showErrors && Boolean(errors.singularName) ? errors.singularName : "Optionally define a singular name for your entities"}
                                    </FieldCaption>
                                </div>
                                <div className={"col-span-12"}>
                                    <TextField
                                        error={showErrors && Boolean(errors.sideDialogWidth)}
                                        name={"sideDialogWidth"}
                                        type={"number"}
                                        aria-describedby={"sideDialogWidth-helper"}
                                        onChange={(e) => {
                                            setFieldTouched("sideDialogWidth", true);
                                            const value = e.target.value;
                                            if (!value) {
                                                setFieldValue("sideDialogWidth", null);
                                            } else if (!isNaN(Number(value))) {
                                                setFieldValue("sideDialogWidth", Number(value));
                                            }
                                        }}
                                        endAdornment={<IconButton
                                            size={"small"}
                                            onClick={() => {
                                                setFieldValue("sideDialogWidth", null);
                                            }}
                                            disabled={!values.sideDialogWidth}>
                                            <CloseIcon size={"small"} />
                                        </IconButton>}
                                        value={values.sideDialogWidth ?? ""}
                                        label={"Side dialog width"} />
                                    <FieldCaption error={showErrors && Boolean(errors.singularName)}>
                                        {showErrors && Boolean(errors.singularName) ? errors.singularName : "Optionally define the width (in pixels) of entities side dialog. Default is 768px"}
                                    </FieldCaption>
                                </div>
                                <div className={"col-span-12"}>
                                    <TextField
                                        error={showErrors && Boolean(errors.description)}
                                        name="description"
                                        value={values.description ?? ""}
                                        onChange={handleChange}
                                        multiline
                                        minRows={2}
                                        aria-describedby="description-helper-text"
                                        label="Description"
                                    />
                                    <FieldCaption error={showErrors && Boolean(errors.description)}>
                                        {showErrors && Boolean(errors.description) ? errors.description : "Description of the collection, you can use markdown"}
                                    </FieldCaption>
                                </div>

                                <div className={"col-span-12"}>
                                    <Select
                                        name="defaultSize"
                                        size={"large"}
                                        fullWidth={true}
                                        label="Default row size"
                                        position={"item-aligned"}
                                        onChange={handleChange}
                                        value={values.defaultSize ?? ""}
                                        renderValue={(value: any) => value.toUpperCase()}
                                    >
                                        {["xs", "s", "m", "l", "xl"].map((value) => (
                                            <SelectItem
                                                key={`size-select-${value}`}
                                                value={value}>
                                                {value.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                <div className={"col-span-12"}>
                                    <BooleanSwitchWithLabel
                                        position={"start"}
                                        size={"large"}
                                        label={values.includeJsonView === undefined || values.includeJsonView ? "Include JSON view" : "Do not include JSON view"}
                                        onValueChange={(v) => setFieldValue("includeJsonView", v)}
                                        value={values.includeJsonView === undefined ? true : values.includeJsonView}
                                    />
                                    <FieldCaption>
                                        Include the JSON representation of the document.
                                    </FieldCaption>
                                </div>

                                <div className={"col-span-12"}>
                                    <BooleanSwitchWithLabel
                                        position={"start"}
                                        size={"large"}
                                        label={values.inlineEditing === undefined || values.inlineEditing ? "Data can be edited directly in the table view" : "Data can be edited only  in the form view"}
                                        onValueChange={(v) => setFieldValue("inlineEditing", v)}
                                        value={values.inlineEditing === undefined ? true : values.inlineEditing}
                                    />
                                    <FieldCaption>
                                        Allow editing data directly in the table view, without opening the form view.
                                    </FieldCaption>
                                </div>

                                <div className={"col-span-12"}>
                                    <Select
                                        name="customId"
                                        label="Document IDs generation"
                                        position={"item-aligned"}
                                        size={"large"}
                                        fullWidth={true}
                                        disabled={customIdValue === "code_defined"}
                                        onValueChange={(v) => {
                                            if (v === "code_defined")
                                                throw new Error("This should not happen");
                                            setFieldValue("customId", v);
                                        }}
                                        value={customIdValue ?? ""}
                                        renderValue={(value: any) => {
                                            if (value === "code_defined")
                                                return "Code defined";
                                            else if (value === "true")
                                                return "Users must define an ID";
                                            else if (value === "optional")
                                                return "Users can define an ID, but it is not required";
                                            else
                                                return "Document ID is generated automatically";
                                        }}
                                    >
                                        <SelectItem value={"false"}>
                                            Document ID is generated automatically
                                        </SelectItem>
                                        <SelectItem value={"true"}>
                                            Users must define an ID
                                        </SelectItem>
                                        <SelectItem value={"optional"}>
                                            Users can define an ID, but it is not required
                                        </SelectItem>
                                    </Select>
                                </div>
                                <div className={"col-span-12 mt-4"}>
                                    <BooleanSwitchWithLabel
                                        position={"start"}
                                        size={"large"}
                                        label="Collection group"
                                        onValueChange={(v) => setFieldValue("collectionGroup", v)}
                                        value={values.collectionGroup ?? false}
                                    />
                                    <FieldCaption>
                                        A collection group consists of all collections with the same path. This allows
                                        you
                                        to query over multiple collections at once.
                                    </FieldCaption>
                                </div>
                                <div className={"col-span-12"}>
                                    <BooleanSwitchWithLabel
                                        position={"start"}
                                        size={"large"}
                                        label="Enable text search for this collection"
                                        onValueChange={(v) => setFieldValue("textSearchEnabled", v)}
                                        value={values.textSearchEnabled ?? false}
                                    />
                                    <FieldCaption>
                                        Allow text search for this collection. If you have not specified a text search
                                        delegate, this will use the built-in local text search. This is not recommended
                                        for large collections, as it may incur in performance and cost issues.
                                    </FieldCaption>
                                </div>


                            </div>
                        </ExpandablePanel>

                        {children}

                    </div>

                </div>

                <div style={{ height: "52px" }} />

                <Dialog
                    open={iconDialogOpen}
                    onOpenChange={setIconDialogOpen}
                    maxWidth={"xl"}
                    fullWidth
                >
                    <div className={"p-4 overflow-auto min-h-[200px]"}>
                        <SearchIconsView selectedIcon={typeof values.icon === "string" ? values.icon : undefined}
                            onIconSelected={(icon: string) => {
                                setIconDialogOpen(false);
                                setFieldValue("icon", icon);
                            }} />
                    </div>

                </Dialog>

            </Container>
        </div>
    );
}

function DefaultDatabaseField({
    databaseId,
    onDatabaseIdUpdate
}: { databaseId?: string, onDatabaseIdUpdate: (databaseId: string) => void }) {

    return <Tooltip title={"Database ID"}
        side={"top"}
        align={"start"}>
        <TextField size={"small"}
            invisible={true}
            inputClassName={"text-end"}
            value={databaseId ?? ""}
            onChange={(e: any) => onDatabaseIdUpdate(e.target.value)}
            placeholder={"(default)"}></TextField>
    </Tooltip>
}
