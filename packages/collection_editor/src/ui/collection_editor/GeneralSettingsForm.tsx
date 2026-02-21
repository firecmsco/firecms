import React, { useState } from "react";
import {
    EntityCollection,
    FieldCaption,
    IconForView,
    SearchIconsView,
    singular,
    toSnakeCase,
    useAuthController,
    useCustomizationController
} from "@firecms/core";
import {
    BooleanSwitchWithLabel,
    Chip,
    cls,
    Container,
    DebouncedTextField,
    Dialog,
    ExpandablePanel,
    IconButton,
    Select,
    SelectItem,
    TextField,
    Tooltip,
    Typography
} from "@firecms/ui";

import { Field, getIn, useFormex } from "@firecms/formex";

export function GeneralSettingsForm({
    isNewCollection,
    existingPaths,
    existingIds,
    parentCollection
}: {
    isNewCollection: boolean;
    existingPaths?: string[];
    existingIds?: string[];
    parentCollection?: EntityCollection;
}) {

    const {
        values,
        setFieldValue,
        handleChange,
        touched,
        errors,
        setFieldTouched,
        submitCount
    } = useFormex<EntityCollection>();

    const [iconDialogOpen, setIconDialogOpen] = useState(false);

    const authController = useAuthController();
    const customizationController = useCustomizationController();

    const updateDatabaseId = (databaseId: string) => {
        setFieldValue("databaseId", databaseId ?? undefined);
    }

    const updateName = (name: string) => {
        setFieldValue("name", name);

        const pathTouched = getIn(touched, "dbPath");
        if (!pathTouched && isNewCollection && name) {
            setFieldValue("dbPath", toSnakeCase(name));
        }

        const idTouched = getIn(touched, "slug");
        if (!idTouched && isNewCollection && name) {
            setFieldValue("slug", toSnakeCase(name));
        }

        const singularNameTouched = getIn(touched, "singularName");
        if (!singularNameTouched && isNewCollection && name) {
            setFieldValue("singularName", singular(name));
        }
    };

    const collectionIcon = <IconForView collectionOrView={values} />;
    const isSubcollection = !!parentCollection;
    const showErrors = submitCount > 0;

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <div>
                    <div className="flex flex-row gap-2 py-2 pt-3 items-center">
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

                    {/* Name */}
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

                    {/* dbPath */}
                    <div className={cls("col-span-12")}>
                        <Field name={"dbPath"}
                            as={DebouncedTextField}
                            label={"Path"}
                            required
                            error={showErrors && Boolean(errors.dbPath)} />

                        <FieldCaption error={touched.dbPath && Boolean(errors.dbPath)}>
                            {touched.dbPath && Boolean(errors.dbPath)
                                ? errors.dbPath
                                : isSubcollection ? "Relative path to the parent (no need to include the parent path)" : "Path that this collection is stored in, in the database"}
                        </FieldCaption>
                    </div>

                    {/* Singular Name */}
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

                    {/* Description */}
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

                    {/* Collection ID */}
                    <div className={"col-span-12"}>
                        <Field name={"slug"}
                            as={DebouncedTextField}
                            disabled={!isNewCollection}
                            label={"Collection ID"}
                            error={showErrors && Boolean(errors.slug)} />
                        <FieldCaption error={touched.slug && Boolean(errors.slug)}>
                            {touched.slug && Boolean(errors.slug) ? errors.slug : "This ID identifies this collection. Typically the same as the path."}
                        </FieldCaption>
                    </div>

                    {/* Collection Group */}
                    <div className={"col-span-12"}>
                        <BooleanSwitchWithLabel
                            position={"start"}
                            size={"large"}
                            label="Collection group"
                            onValueChange={(v) => setFieldValue("collectionGroup", v)}
                            value={values.collectionGroup ?? false}
                        />
                        <FieldCaption>
                            A collection group consists of all collections with the same path. This allows
                            you to query over multiple collections at once.
                        </FieldCaption>
                    </div>

                </div>

                {/* Advanced Settings */}
                <ExpandablePanel
                    title={<Typography variant="subtitle2">Advanced settings</Typography>}
                    initiallyExpanded={false}
                    className="mt-4"
                    innerClassName="p-4 flex flex-col gap-4"
                >
                    {/* History revisions */}
                    <div>
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

                    {/* Document ID generation */}
                    <div>
                        <Select
                            name="customId"
                            label="Document IDs generation"
                            position={"item-aligned"}
                            size={"large"}
                            fullWidth={true}
                            disabled={typeof values.customId === "object"}
                            onValueChange={(v) => {
                                if (v === "code_defined")
                                    throw new Error("This should not happen");
                                if (v === "false") setFieldValue("customId", false);
                                else if (v === "true") setFieldValue("customId", true);
                                else if (v === "optional") setFieldValue("customId", "optional");
                            }}
                            value={
                                typeof values.customId === "object" ? "code_defined" :
                                    values.customId === (true as any) ? "true" :
                                        values.customId === "optional" ? "optional" : "false"
                            }
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
                        <FieldCaption>
                            Configure how document IDs are generated when creating new entities.
                        </FieldCaption>
                    </div>
                </ExpandablePanel>

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
