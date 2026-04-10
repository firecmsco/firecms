import { IconForView } from "@rebasepro/core";
import { FieldCaption, useCollectionRegistryController } from "../../../_cms_internals";
import React from "react";
import { Field, getIn, useFormex } from "@rebasepro/formex";
;
import { NumberProperty, StringProperty } from "@rebasepro/types";
import { CircularProgress, Select, SelectGroup, SelectItem, Typography, } from "@rebasepro/ui";

export function ReferencePropertyField({
    existing,
    multiple,
    disabled,
    showErrors,
    asString
}: {
    existing: boolean,
    multiple: boolean,
    disabled: boolean,
    showErrors: boolean,
    asString?: boolean
}) {

    const {
        values,
        errors,
        setFieldValue,
    } = useFormex<StringProperty | NumberProperty>();

    const collectionRegistry = useCollectionRegistryController();

    if (!collectionRegistry.initialised)
        return <div className={"col-span-12"}>
            <CircularProgress />
        </div>;

    const pathPath = asString ? "reference.slug" : (multiple ? "of.slug" : "path");
    const pathValue: string | undefined = getIn(values, pathPath);
    const pathError: string | undefined = showErrors && getIn(errors, pathPath);

    return (
        <>
            <div className={"col-span-12"}>

                <Field name={pathPath}
                    pathPath={pathPath}
                    type="select"
                    disabled={disabled}
                    value={pathValue}
                    error={pathError}
                    setFieldValue={setFieldValue}
                    as={CollectionsSelect} />

            </div>

        </>
    );
}

export function CollectionsSelect({
    disabled,
    pathPath,
    value,
    setFieldValue,
    error,
    ...props
}: {
    disabled: boolean,
    pathPath: string,
    value?: string,
    setFieldValue: (field: string, value: string) => void,
    error?: string
}) {

    const collectionRegistry = useCollectionRegistryController();

    if (!collectionRegistry.initialised)
        return <div className={"col-span-12"}>
            <CircularProgress />
        </div>;

    const collections = collectionRegistry.collections ?? [];

    const groups: string[] = Array.from(new Set(
        Object.values(collections).map(e => e.group).filter(Boolean) as string[]
    ).values());

    const ungroupedCollections = collections.filter((col) => !col.group);

    return (
        <>
            <Select
                error={Boolean(error)}
                disabled={disabled}
                value={value ?? ""}
                position={"item-aligned"}
                name={pathPath}
                fullWidth={true}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFieldValue(pathPath, e.target.value)}
                label={"Target collection"}
                renderValue={(selected: string) => {
                    const selectedCollection = collections.find(collection => collection.slug === selected || collection.dbPath === selected);
                    if (!selectedCollection) return null;
                    return (
                        <div className="flex flex-row">
                            <IconForView collectionOrView={selectedCollection} />
                            <Typography
                                variant={"subtitle2"}
                                className="ml-4">
                                {selectedCollection?.name.toUpperCase()}
                            </Typography>
                        </div>)
                }}
                {...props}>

                {groups.flatMap((group) => (
                    <SelectGroup label={group || "Views"}
                        key={`group_${group}`}>
                        {
                            collections.filter(collection => collection.group === group)
                                .map((collection) => {
                                    return <SelectItem
                                        key={`${collection.slug ?? collection.dbPath}-${group}`}
                                        value={collection.slug ?? collection.dbPath}>
                                        <div className="flex flex-row">
                                            <IconForView collectionOrView={collection} />
                                            <Typography
                                                variant={"subtitle2"}
                                                className="ml-4">
                                                {collection?.name.toUpperCase()}
                                            </Typography>
                                        </div>
                                    </SelectItem>;
                                })

                        }
                    </SelectGroup>
                ))}

                {ungroupedCollections && <SelectGroup label={"Views"}>
                    {ungroupedCollections
                        .map((collection) => {
                            return <SelectItem key={collection.slug ?? collection.dbPath}
                                value={collection.slug ?? collection.dbPath}>
                                <div className="flex flex-row">
                                    <IconForView collectionOrView={collection} />
                                    <Typography
                                        variant={"subtitle2"}
                                        className="ml-4">
                                        {collection?.name.toUpperCase()}
                                    </Typography>
                                </div>
                            </SelectItem>;
                        })

                    }
                </SelectGroup>}

            </Select>

        </>
    );
}
