import React, { useCallback, useState } from "react";
import {
    Autocomplete,
    AutocompleteItem,
    BooleanSwitchWithLabel,
    Chip,
    cn,
    Container,
    DebouncedTextField,
    Dialog,
    EntityCollection,
    ExpandablePanel,
    getIconForView,
    IconButton,
    Select,
    SelectItem,
    SettingsIcon,
    singular,
    TextField,
    Tooltip,
    toSnakeCase,
    Typography,
    useAutoComplete
} from "@firecms/core";
import { Field, getIn, useFormikContext } from "formik";

//@ts-ignore
import { SearchIcons } from "./SelectIcons";
import { FieldHelperView } from "./properties/FieldHelperView";

export function CollectionDetailsForm({
                                          isNewCollection,
                                          reservedGroups,
                                          existingPaths,
                                          existingAliases,
                                          groups,
                                          parentCollection
                                      }: {
    isNewCollection: boolean,
    reservedGroups?: string[];
    existingPaths?: string[];
    existingAliases?: string[];
    groups: string[] | null;
    parentCollection?: EntityCollection;
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
    } = useFormikContext<EntityCollection>();

    const [iconDialogOpen, setIconDialogOpen] = useState(false);

    const updateName = (name: string) => {
        setFieldValue("name", name);

        const pathTouched = getIn(touched, "path");
        if (!pathTouched && isNewCollection && name) {
            setFieldValue("path", toSnakeCase(name));
        }

        const singularNameTouched = getIn(touched, "singularName");
        if (!singularNameTouched && isNewCollection && name) {
            setFieldValue("singularName", singular(name))
        }

    };

    const collectionIcon = getIconForView(values);

    const validatePath = useCallback((value: string) => {
        let error;
        if (!value) {
            error = "You must specify a path in the database for this collection";
        }
        if (isNewCollection && existingAliases?.includes(value.trim().toLowerCase()))
            error = "There is already a collection which uses this path as an alias";
        if (isNewCollection && existingPaths?.includes(value.trim().toLowerCase()) && !values.alias)
            error = "There is already a collection with the specified path. If you want to have multiple collections referring to the same database path, you need to define an alias in at least one of the collections";
        return error;
    }, [isNewCollection, existingAliases, existingPaths, values.alias]);

    const validateAlias = useCallback((value: string) => {
        if (!value) return undefined;
        let error;
        if (isNewCollection && existingPaths?.includes(value.trim().toLowerCase()))
            error = "There is already a collection that uses this value as a path";
        if (isNewCollection && existingAliases?.includes(value.trim().toLowerCase()))
            error = "There is already a collection which uses this alias";
        return error;
    }, [isNewCollection, existingPaths, existingAliases]);

    const groupOptions = groups?.filter((group) => !reservedGroups?.includes(group));

    const {
        inputFocused,
        autoCompleteOpen,
        setAutoCompleteOpen
    } = useAutoComplete({
        ref: groupRef
    });

    const isSubcollection = !!parentCollection;

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <div>
                    <div
                        className="flex flex-row py-2 pt-3 items-center">
                        <Typography variant={!isNewCollection ? "h5" : "h4"} className={"flex-grow"}>
                            {isNewCollection ? "New collection" : `${values.name} collection`}
                        </Typography>
                        <Tooltip title={"Change icon"}>
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
                            required
                            error={touched.name && Boolean(errors.name)}/>
                        <FieldHelperView error={touched.name && Boolean(errors.name)}>
                            {touched.name && Boolean(errors.name) ? errors.name : "Name of in this collection, usually a plural name (e.g. Products)"}
                        </FieldHelperView>
                    </div>

                    <div className={cn("col-span-12 ", isSubcollection ? "" : "sm:col-span-8")}>
                        <Field name={"path"}
                               as={DebouncedTextField}
                               label={"Path"}
                               validate={validatePath}
                               disabled={!isNewCollection}
                               required
                               error={touched.path && Boolean(errors.path)}/>

                        <FieldHelperView error={touched.path && Boolean(errors.path)}>
                            {touched.path && Boolean(errors.path) ? errors.path : "Path that this collection is stored in"}
                        </FieldHelperView>

                    </div>

                    {!isSubcollection && <div className={"col-span-12 sm:col-span-4 relative"}>

                        <TextField error={touched.group && Boolean(errors.group)}
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
                        <FieldHelperView>
                            {touched.group && Boolean(errors.group) ? errors.group : "Group of the collection"}
                        </FieldHelperView>
                    </div>}

                    <div className={"col-span-12"}>
                        <ExpandablePanel
                            title={
                                <div className="flex flex-row text-gray-500">
                                    <SettingsIcon/>
                                    <Typography variant={"subtitle2"}
                                                className="ml-2">
                                        Advanced
                                    </Typography>
                                </div>}
                            initiallyExpanded={false}>
                            <div className={"grid grid-cols-12 gap-4 p-4"}>
                                <div className={"col-span-12"}>
                                    <TextField
                                        error={touched.singularName && Boolean(errors.singularName)}
                                        id={"singularName"}
                                        aria-describedby={"singularName-helper"}
                                        onChange={(e) => {
                                            setFieldTouched("singularName", true);
                                            return handleChange(e);
                                        }}
                                        value={values.singularName ?? ""}
                                        label={"Singular name"}/>
                                    <FieldHelperView error={touched.singularName && Boolean(errors.singularName)}>
                                        {touched.singularName && Boolean(errors.singularName) ? errors.singularName : "Optionally define a singular name for your entities"}
                                    </FieldHelperView>
                                </div>
                                <div className={"col-span-12"}>
                                    <TextField
                                        error={touched.description && Boolean(errors.description)}
                                        id="description"
                                        value={values.description ?? ""}
                                        onChange={handleChange}
                                        multiline
                                        rows={2}
                                        aria-describedby="description-helper-text"
                                        label="Description"
                                    />
                                    <FieldHelperView error={touched.description && Boolean(errors.description)}>
                                        {touched.description && Boolean(errors.description) ? errors.description : "Description of the collection, you can use markdown"}
                                    </FieldHelperView>
                                </div>

                                <div className={"col-span-12"}>
                                    <Field name={"alias"}
                                           as={DebouncedTextField}
                                           disabled={!isNewCollection}
                                           label={"Alias"}
                                           validate={validateAlias}
                                           error={touched.alias && Boolean(errors.alias)}/>
                                    <FieldHelperView error={touched.alias && Boolean(errors.alias)}>
                                        {touched.alias && Boolean(errors.alias) ? errors.alias : "Use an alias as an ID when you have multiple collections located in the same path"}
                                    </FieldHelperView>
                                </div>

                                <div className={"col-span-12"}>
                                    <Select
                                        name="defaultSize"
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
                                        label="Collection group"
                                        onValueChange={(v) => setFieldValue("collectionGroup", v)}
                                        value={values.collectionGroup ?? false}
                                    />
                                    <FieldHelperView>
                                        A collection group consists of all collections with the same ID. This allows you
                                        to query over multiple collections at once.
                                    </FieldHelperView>
                                </div>
                            </div>
                        </ExpandablePanel>

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
                        <SearchIcons selectedIcon={values.icon}
                                     onIconSelected={(icon: string) => {
                                         setIconDialogOpen(false);
                                         setFieldValue("icon", icon);
                                     }}/>
                    </div>

                </Dialog>

            </Container>
        </div>
    )
        ;
}
