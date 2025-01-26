import React, { useEffect, useState } from "react";
import { EntityCollection, FieldCaption, IconForView, SearchIconsView, singular, toSnakeCase, } from "@firecms/core";
import {
    Autocomplete,
    AutocompleteItem,
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

export function CollectionDetailsForm({
                                          isNewCollection,
                                          reservedGroups,
                                          existingPaths,
                                          existingIds,
                                          groups,
                                          parentCollection,
                                          children
                                      }: {
    isNewCollection: boolean,
    reservedGroups?: string[];
    existingPaths?: string[];
    existingIds?: string[];
    groups: string[] | null;
    parentCollection?: EntityCollection;
    parentCollectionIds?: string[];
    children?: React.ReactNode;
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

    const DatabaseField = collectionEditor.components?.DatabaseField ?? DefaultDatabaseField;

    const collectionIcon = <IconForView collectionOrView={values}/>;

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
                        <DatabaseField databaseId={values.databaseId}
                                       onDatabaseIdUpdate={updateDatabaseId}/>

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
                            error={showErrors && Boolean(errors.name)}/>
                        <FieldCaption error={touched.name && Boolean(errors.name)}>
                            {touched.name && Boolean(errors.name) ? errors.name : "Name of this collection, usually a plural name (e.g. Products)"}
                        </FieldCaption>
                    </div>

                    <div className={cls("col-span-12 ", isSubcollection ? "" : "sm:col-span-8")}>
                        <Field name={"path"}
                               as={DebouncedTextField}
                               label={"Path"}
                               disabled={!isNewCollection}
                               required
                               error={showErrors && Boolean(errors.path)}/>

                        <FieldCaption error={touched.path && Boolean(errors.path)}>
                            {touched.path && Boolean(errors.path)
                                ? errors.path
                                : isSubcollection ? "Relative path to the parent (no need to include the parent path)" : "Path that this collection is stored in, in the database"}
                        </FieldCaption>

                    </div>

                    {!isSubcollection && <div className={"col-span-12 sm:col-span-4 relative"}>

                        <TextField error={showErrors && Boolean(errors.group)}
                                   disabled={isSubmitting}
                                   value={values.group ?? ""}
                                   autoComplete="off"
                                   onChange={(event) => setFieldValue("group", event.target.value)}
                                   name={"group"}
                                   inputRef={groupRef}
                                   label="Group"/>
                        <Autocomplete
                            open={autoCompleteOpen && (groupOptions ?? []).length > 0}
                            setOpen={setAutoCompleteOpen}>
                            {groupOptions?.map((group, index) => {
                                return <AutocompleteItem
                                    key={index + "_" + group}
                                    onClick={() => {
                                        setAutoCompleteOpen(false);
                                        setFieldValue("group", group ?? null);
                                    }}
                                >
                                    <div className={"flex-grow"}>
                                        {group}
                                    </div>
                                </AutocompleteItem>;
                            })}
                        </Autocomplete>
                        <FieldCaption>
                            {showErrors && Boolean(errors.group) ? errors.group : "Group in the home page"}
                        </FieldCaption>


                    </div>}

                    <LayoutModeSwitch
                        className={"col-span-12"}
                        value={values.openEntityMode ?? "side_panel"}
                        onChange={(value) => setFieldValue("openEntityMode", value)}/>

                    <div className={"col-span-12 mt-8"}>
                        <ExpandablePanel
                            expanded={advancedPanelExpanded}
                            onExpandedChange={setAdvancedPanelExpanded}
                            title={
                                <div className="flex flex-row text-surface-500">
                                    <SettingsIcon/>
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
                                           error={showErrors && Boolean(errors.id)}/>
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
                                        label={"Singular name"}/>
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
                                            <CloseIcon size={"small"}/>
                                        </IconButton>}
                                        value={values.sideDialogWidth ?? ""}
                                        label={"Side dialog width"}/>
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
                                        rows={2}
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
                                            else if (v === "true")
                                                setFieldValue("customId", true);
                                            else if (v === "false")
                                                setFieldValue("customId", false);
                                            else if (v === "optional")
                                                setFieldValue("customId", "optional");
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
                                <div className={"col-span-12"}>
                                    <BooleanSwitchWithLabel
                                        position={"start"}
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

                <div style={{ height: "52px" }}/>

                <Dialog
                    open={iconDialogOpen}
                    onOpenChange={setIconDialogOpen}
                    maxWidth={"xl"}
                    fullWidth
                >
                    <div className={"p-4 overflow-auto min-h-[200px]"}>
                        <SearchIconsView selectedIcon={values.icon}
                                         onIconSelected={(icon: string) => {
                                             setIconDialogOpen(false);
                                             setFieldValue("icon", icon);
                                         }}/>
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
