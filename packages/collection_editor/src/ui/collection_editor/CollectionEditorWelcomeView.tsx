import React, { useEffect, useState } from "react";
import { EntityCollection, unslugify, } from "@firecms/core";
import { Button, Card, Chip, CircularProgress, cls, Container, Icon, Tooltip, Typography, } from "@firecms/ui";

import { productsCollectionTemplate } from "./templates/products_template";
import { blogCollectionTemplate } from "./templates/blog_template";
import { usersCollectionTemplate } from "./templates/users_template";
import { ImportFileUpload } from "@firecms/data_import_export";
import { pagesCollectionTemplate } from "./templates/pages_template";
import { useFormex } from "@firecms/formex";

export function CollectionEditorWelcomeView({
                                                path,
                                                pathSuggestions,
                                                parentCollection,
                                                onContinue,
                                                existingCollectionPaths
                                            }: {
    path: string;
    pathSuggestions?: (path: string) => Promise<string[]>;
    parentCollection?: EntityCollection;
    onContinue: (importData?: object[], propertiesOrder?: string[]) => void;
    existingCollectionPaths?: string[];
}) {

    const [loadingPathSuggestions, setLoadingPathSuggestions] = useState(false);
    const [filteredPathSuggestions, setFilteredPathSuggestions] = useState<string[] | undefined>();
    useEffect(() => {
        if (pathSuggestions && existingCollectionPaths) {
            setLoadingPathSuggestions(true);
            pathSuggestions(path)
                .then(suggestions => {
                    const filteredSuggestions = suggestions.filter(s => !(existingCollectionPaths ?? []).find(c => c.trim().toLowerCase() === s.trim().toLowerCase()));
                    setFilteredPathSuggestions(filteredSuggestions);
                })
                .finally(() => setLoadingPathSuggestions(false));
        }
    }, [existingCollectionPaths, path, pathSuggestions]);

    const {
        values,
        setFieldValue,
        setValues,
        submitCount
    } = useFormex<EntityCollection>();

    const noSuggestions = !loadingPathSuggestions && (filteredPathSuggestions ?? [])?.length === 0;
    if (!noSuggestions) {
        return null;
    }

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <div
                    className="flex flex-row py-2 pt-3 items-center">
                    <Typography variant={"h4"} className={"flex-grow"}>
                        New collection
                    </Typography>
                </div>

                {parentCollection && <Chip colorScheme={"tealDarker"}>
                    <Typography variant={"caption"}>
                        This is a subcollection of <b>{parentCollection.name}</b>
                    </Typography>
                </Chip>}

                <div className={"my-2"}>
                    <Typography variant={"caption"}
                                color={"secondary"}>
                        ● Use one of the existing paths in your database:
                    </Typography>
                    <div className={"flex flex-wrap gap-x-2 gap-y-1 items-center my-2 min-h-7"}>

                        {loadingPathSuggestions && !filteredPathSuggestions && <CircularProgress size={"small"}/>}

                        {filteredPathSuggestions?.map((suggestion, index) => (
                            <Chip key={suggestion}
                                  colorScheme={"cyanLighter"}
                                  onClick={() => {
                                      setFieldValue("name", unslugify(suggestion));
                                      setFieldValue("id", suggestion);
                                      setFieldValue("path", suggestion);
                                      setFieldValue("properties", undefined);
                                      onContinue();
                                  }}
                                  size="small">
                                {suggestion}
                            </Chip>
                        ))}

                    </div>

                </div>

                <div className={"my-2"}>
                    <Typography variant={"caption"}
                                color={"secondary"}>
                        ● Select a template:
                    </Typography>

                    <div className={"flex gap-4"}>
                        <TemplateButton title={"Products"}
                                        subtitle={"A collection of products with images, prices and stock"}
                                        icon={<Icon size={"small"}
                                                    iconKey={productsCollectionTemplate.icon! as string}/>}
                                        onClick={() => {
                                            setValues(productsCollectionTemplate);
                                            onContinue();
                                        }}/>
                        <TemplateButton title={"Users"}
                                        subtitle={"A collection of users with emails, names and roles"}
                                        icon={<Icon size={"small"} iconKey={usersCollectionTemplate.icon! as string}/>}
                                        onClick={() => {
                                            setValues(usersCollectionTemplate);
                                            onContinue();
                                        }}/>
                        <TemplateButton title={"Blog posts"}
                                        subtitle={"A collection of blog posts with images, authors and complex content"}
                                        icon={<Icon size={"small"} iconKey={blogCollectionTemplate.icon! as string}/>}
                                        onClick={() => {
                                            setValues(blogCollectionTemplate);
                                            onContinue();
                                        }}/>
                        <TemplateButton title={"Pages"}
                                        subtitle={"A collection of pages with images, authors and complex content"}
                                        icon={<Icon size={"small"} iconKey={pagesCollectionTemplate.icon! as string}/>}
                                        onClick={() => {
                                            setValues(pagesCollectionTemplate);
                                            onContinue();
                                        }}/>
                    </div>

                </div>

                {!parentCollection && <div>

                    <Typography variant={"caption"}
                                color={"secondary"}
                                className={"mb-2"}>
                        ● Create a collection from a file (csv, json, xls, xslx...)
                    </Typography>

                    <ImportFileUpload onDataAdded={(data, propertiesOrder) => onContinue(data, propertiesOrder)}/>

                </div>}

                <div>

                    <Button variant={"text"} onClick={() => onContinue()} className={"my-2"}>
                        Continue from scratch
                    </Button>
                </div>

                {/*<div style={{ height: "52px" }}/>*/}

            </Container>
        </div>
    );
}

export function TemplateButton({
                                   title,
                                   subtitle,
                                   icon,
                                   onClick
                               }: {
    title: string,
    icon: React.ReactNode,
    subtitle: string,
    onClick?: () => void
}) {

    return (
        <Tooltip title={subtitle}
                 asChild={true}>
            <Card
                onClick={onClick}
                className={cls(
                    "my-2 rounded-md border mx-0 p-6 px-4 focus:outline-none transition ease-in-out duration-150 flex flex-row gap-4 items-center",
                    "text-surface-700 dark:text-surface-accent-300",
                    "hover:border-primary-dark hover:text-primary-dark dark:hover:text-primary focus:ring-primary hover:ring-1 hover:ring-primary",
                    "border-surface-400 dark:border-surface-600 "
                )}
            >
                {icon}
                <div className={"flex flex-col items-start"}>

                    <Typography variant={"subtitle1"}>
                        {title}
                    </Typography>

                </div>
            </Card>
        </Tooltip>
    );

}
