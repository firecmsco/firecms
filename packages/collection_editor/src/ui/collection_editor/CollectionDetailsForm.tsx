import React, { useMemo, useState } from "react";
import { EntityCollection, FieldCaption, getFieldConfig, IconForView, Property, PropertyConfigBadge, resolveCollection, SearchIconsView, singular, toSnakeCase, unslugify, useAuthController, useCustomizationController, useTranslation } from "@firecms/core";
import {
    BooleanSwitchWithLabel,
    Chip,
    CloseIcon,
    cls,
    Container,
    DebouncedTextField,
    Dialog,
    HistoryIcon,
    IconButton,
    Select,
    SelectItem,
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
    expandKanban
}: {
    isNewCollection: boolean,
    reservedGroups?: string[];
    existingPaths?: string[];
    existingIds?: string[];
    groups: string[] | null;
    parentCollection?: EntityCollection;
    parentCollectionIds?: string[];
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
    const [orderPropertyDialogOpen, setOrderPropertyDialogOpen] = useState(false);

    const { t } = useTranslation();

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

    const showErrors = submitCount > 0;

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <div>
                    <div
                        className="flex flex-row gap-2 py-2 pt-3 items-center">
                        <Typography variant={!isNewCollection ? "h5" : "h4"} className={"flex-grow"}>
                            {isNewCollection ? t("new_collection") : t("collection_with_name", { name: values?.name || "" })}
                        </Typography>
                        <DefaultDatabaseField databaseId={values.databaseId}
                            onDatabaseIdUpdate={updateDatabaseId} />

                        <Tooltip title={t("change_icon")}
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
                            {t("is_subcollection_of")} <b>{parentCollection.name}</b>
                        </Typography>
                    </Chip>}

                </div>
                <div className={"grid grid-cols-12 gap-4"}>

                    <div className={"col-span-12"}>
                        <TextField
                            value={values.name ?? ""}
                            onChange={(e: any) => updateName(e.target.value)}
                            label={t("name")}
                            autoFocus={true}
                            required
                            error={showErrors && Boolean(errors.name)} />
                        <FieldCaption error={touched.name && Boolean(errors.name)}>
                            {touched.name && Boolean(errors.name) ? errors.name : t("collection_name_description")}
                        </FieldCaption>
                    </div>

                    <div className={cls("col-span-12 ")}>
                        <Field name={"path"}
                            as={DebouncedTextField}
                            label={t("path")}
                            required
                            error={showErrors && Boolean(errors.path)} />

                        <FieldCaption error={touched.path && Boolean(errors.path)}>
                            {touched.path && Boolean(errors.path)
                                ? errors.path
                                : isSubcollection ? t("relative_path_to_parent") : t("path_in_database")}
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
                                        label={t("order_property")}
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
                                                return <span className="text-red-500">{value} ({t("not_found_suffix")})</span>;
                                            }
                                            const prop = numberProperties.find(p => p.key === value);
                                            if (!prop) return t("select_a_property");
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
                                                                {fieldConfig?.name || t("number")}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </Select>
                                    <FieldCaption error={orderPropertyMissing}>
                                        {orderPropertyMissing
                                            ? t("order_property_not_found", { property: values.orderProperty ?? "" })
                                            : numberProperties.length === 0
                                                ? t("no_number_properties")
                                                : t("order_property_description")
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
                                        {t("create_property", { property: dialogPropertyKey })}
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
                            label={<span className="flex items-center gap-2"><HistoryIcon size={"smallest"} />{values.history === null || values.history === undefined ? t("doc_history_global") : (
                                values.history ? t("doc_history_enabled") : t("doc_history_not_enabled")
                            )}</span>}
                            onValueChange={(v) => setFieldValue("history", v)}
                            value={values.history === undefined ? null : values.history}
                        />
                        <FieldCaption>
                            {t("doc_history_description")}
                        </FieldCaption>
                    </div>


                    <div className={"col-span-12 mt-8"}>

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

    const { t } = useTranslation();

    return <Tooltip title={t("database_id")}
        side={"top"}
        align={"start"}>
        <TextField size={"small"}
            invisible={true}
            inputClassName={"text-end"}
            value={databaseId ?? ""}
            onChange={(e: any) => onDatabaseIdUpdate(e.target.value)}
            placeholder={t("default_text")}></TextField>
    </Tooltip>
}
