import React from "react";
import { Field, getIn, useFormex } from "@firecms/formex";
import { FieldCaption, IconForView, NumberProperty, StringProperty, useNavigationController } from "@firecms/core";
import { CircularProgress, Select, SelectGroup, SelectItem, Typography, } from "@firecms/ui";

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
        handleChange,
        errors,
    } = useFormex<StringProperty | NumberProperty>();

    const navigation = useNavigationController();

    if (!navigation)
        return <div className={"col-span-12"}>
            <CircularProgress/>
        </div>;

    const pathPath = asString ? "reference.path" : (multiple ? "of.path" : "path") ;
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
                       handleChange={handleChange}
                       as={CollectionsSelect}/>

            </div>

        </>
    );
}

export function CollectionsSelect({
                                      disabled,
                                      pathPath,
                                      value,
                                      handleChange,
                                      error,
                                      ...props
                                  }: {
    disabled: boolean,
    pathPath: string,
    value?: string,
    handleChange: (event: any) => void,
    error?: string
}) {

    const navigation = useNavigationController();

    if (!navigation)
        return <div className={"col-span-12"}>
            <CircularProgress/>
        </div>;

    const collections = navigation?.collections ?? [];

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
                size={"large"}
                fullWidth={true}
                onChange={handleChange}
                label={"Target collection"}
                renderValue={(selected) => {
                    const selectedCollection = collections.find(collection => collection.id === selected || collection.path === selected);
                    if (!selectedCollection) return null;
                    return (
                        <div className="flex flex-row">
                            <IconForView collectionOrView={selectedCollection}/>
                            <Typography
                                variant={"subtitle2"}
                                className="font-medium ml-4">
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
                                        key={`${collection.id ?? collection.path}-${group}`}
                                        value={collection.id ?? collection.path}>
                                        <div className="flex flex-row">
                                            <IconForView collectionOrView={collection}/>
                                            <Typography
                                                variant={"subtitle2"}
                                                className="font-medium ml-4">
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
                            return <SelectItem key={collection.id ?? collection.path}
                                               value={collection.id ?? collection.path}>
                                <div className="flex flex-row">
                                    <IconForView collectionOrView={collection}/>
                                    <Typography
                                        variant={"subtitle2"}
                                        className="font-medium ml-4">
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
