import React, { useState } from "react";
import {
    EntityCollection,
    FieldCaption,
    IconForView,
    SearchIconsView,
    singular,
    toSnakeCase,
    useAuthController,
    useCustomizationController,
    useTranslation
} from "@firecms/core";
import {
    BooleanSwitchWithLabel,
    Chip,
    cls,
    Container,
    DebouncedTextField,
    Dialog,
    ExpandablePanel,
    HistoryIcon,
    IconButton,
    SearchIcon,
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
    const { t } = useTranslation();

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
    const isSubcollection = !!parentCollection;
    const showErrors = submitCount > 0;

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <div>
                    <div className="flex flex-row gap-2 py-2 pt-3 items-center">
                        <Typography variant={!isNewCollection ? "h5" : "h4"} className={"flex-grow"}>
                            {isNewCollection ? t("new_collection") : t("collection_with_name", { name: values?.name })}
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

                    {/* Name */}
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

                    {/* Path */}
                    <div className={cls("col-span-12")}>
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
                            label={t("singular_name")} />
                        <FieldCaption error={showErrors && Boolean(errors.singularName)}>
                            {showErrors && Boolean(errors.singularName) ? errors.singularName : t("singular_name_description")}
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
                            label={t("description")}
                        />
                        <FieldCaption error={showErrors && Boolean(errors.description)}>
                            {showErrors && Boolean(errors.description) ? errors.description : t("description_of_collection")}
                        </FieldCaption>
                    </div>

                    {/* Collection ID */}
                    <div className={"col-span-12"}>
                        <Field name={"id"}
                            as={DebouncedTextField}
                            disabled={!isNewCollection}
                            label={t("collection_id")}
                            error={showErrors && Boolean(errors.id)} />
                        <FieldCaption error={touched.id && Boolean(errors.id)}>
                            {touched.id && Boolean(errors.id) ? errors.id : t("collection_id_description")}
                        </FieldCaption>
                    </div>

                    {/* Collection Group */}
                    <div className={"col-span-12"}>
                        <BooleanSwitchWithLabel
                            position={"start"}
                            size={"large"}
                            label={t("collection_group")}
                            onValueChange={(v) => setFieldValue("collectionGroup", v)}
                            value={values.collectionGroup ?? false}
                        />
                        <FieldCaption>
                            {t("collection_group_description")}
                        </FieldCaption>
                    </div>

                </div>

                {/* Advanced Settings */}
                <ExpandablePanel
                    title={<Typography variant="subtitle2">{t("advanced_settings")}</Typography>}
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

                    {/* Document ID generation */}
                    <div>
                        <Select
                            name="customId"
                            label={t("document_id_generation")}
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
                                    values.customId === true ? "true" :
                                        values.customId === "optional" ? "optional" : "false"
                            }
                            renderValue={(value: any) => {
                                if (value === "code_defined")
                                    return t("code_defined");
                                else if (value === "true")
                                    return t("users_must_define_id");
                                else if (value === "optional")
                                    return t("users_can_define_id");
                                else
                                    return t("doc_id_auto_generated");
                            }}
                        >
                            <SelectItem value={"false"}>
                                {t("doc_id_auto_generated")}
                            </SelectItem>
                            <SelectItem value={"true"}>
                                {t("users_must_define_id")}
                            </SelectItem>
                            <SelectItem value={"optional"}>
                                {t("users_can_define_id")}
                            </SelectItem>
                        </Select>
                        <FieldCaption>
                            {t("config_doc_id_generation")}
                        </FieldCaption>
                    </div>

                    {/* Text search */}
                    <div>
                        <BooleanSwitchWithLabel
                            position={"start"}
                            size={"large"}
                            label={<span className="flex items-center gap-2"><SearchIcon size={"smallest"} />{t("enable_text_search")}</span>}
                            onValueChange={(v) => setFieldValue("textSearchEnabled", v)}
                            value={values.textSearchEnabled ?? false}
                        />
                        <FieldCaption>
                            {t("text_search_description")}
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
