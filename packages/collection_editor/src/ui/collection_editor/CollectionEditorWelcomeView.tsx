import React, { useState } from "react";
import { EntityCollection, prettifyIdentifier, } from "@firecms/core";
import { Button, Card, Chip, cls, CodeIcon, Container, Icon, Tooltip, Typography, } from "@firecms/ui";
import { CollectionJsonImportDialog } from "./CollectionJsonImportDialog";

import { productsCollectionTemplate } from "./templates/products_template";
import { blogCollectionTemplate } from "./templates/blog_template";
import { usersCollectionTemplate } from "./templates/users_template";
import { ImportFileUpload } from "@firecms/data_import";
import { pagesCollectionTemplate } from "./templates/pages_template";
import { useFormex } from "@firecms/formex";
import { useCollectionEditorController } from "../../useCollectionEditorController";

export function CollectionEditorWelcomeView({
    path,
    parentCollection,
    onContinue,
    existingCollectionPaths
}: {
    path: string;
    parentCollection?: EntityCollection;
    onContinue: (importData?: object[], propertiesOrder?: string[]) => void;
    existingCollectionPaths?: string[];
}) {

    const { pathSuggestions } = useCollectionEditorController();

    const filteredSuggestions = (pathSuggestions ?? []).filter(s => !(existingCollectionPaths ?? []).find(c => c.trim().toLowerCase() === s.trim().toLowerCase()));

    const {
        values,
        setFieldValue,
        setValues,
        submitCount
    } = useFormex<EntityCollection>();

    const [jsonImportOpen, setJsonImportOpen] = useState(false);

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

                {(filteredSuggestions ?? []).length > 0 && <div className={"my-2"}>

                    <Typography variant={"caption"}
                        color={"secondary"}>
                        ● Use one of the existing paths in your database:
                    </Typography>
                    <div className={"flex flex-wrap gap-x-2 gap-y-1 items-center my-2 min-h-7"}>

                        {filteredSuggestions?.map((suggestion, index) => (
                            <Chip key={suggestion}
                                colorScheme={"cyanLighter"}
                                onClick={() => {
                                    setFieldValue("name", prettifyIdentifier(suggestion));
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

                </div>}

                <div className={"my-2"}>
                    <Typography variant={"caption"}
                        color={"secondary"}>
                        ● Select a template:
                    </Typography>

                    <div className={"flex gap-4"}>
                        <TemplateButton title={"Products"}
                            subtitle={"A collection of products with images, prices and stock"}
                            icon={<Icon size={"small"}
                                iconKey={productsCollectionTemplate.icon! as string} />}
                            onClick={() => {
                                setValues(productsCollectionTemplate);
                                onContinue();
                            }} />
                        <TemplateButton title={"Users"}
                            subtitle={"A collection of users with emails, names and roles"}
                            icon={<Icon size={"small"} iconKey={usersCollectionTemplate.icon! as string} />}
                            onClick={() => {
                                setValues(usersCollectionTemplate);
                                onContinue();
                            }} />
                        <TemplateButton title={"Blog posts"}
                            subtitle={"A collection of blog posts with images, authors and complex content"}
                            icon={<Icon size={"small"} iconKey={blogCollectionTemplate.icon! as string} />}
                            onClick={() => {
                                setValues(blogCollectionTemplate);
                                onContinue();
                            }} />
                        <TemplateButton title={"Pages"}
                            subtitle={"A collection of pages with images, authors and complex content"}
                            icon={<Icon size={"small"} iconKey={pagesCollectionTemplate.icon! as string} />}
                            onClick={() => {
                                setValues(pagesCollectionTemplate);
                                onContinue();
                            }} />
                    </div>

                </div>

                {!parentCollection && <div>

                    <Typography variant={"caption"}
                        color={"secondary"}
                        className={"mb-2"}>
                        ● Create a collection from a file (csv, json, xls, xslx...)
                    </Typography>

                    <ImportFileUpload onDataAdded={(data, propertiesOrder) => onContinue(data, propertiesOrder)} />

                </div>}

                <div className={"my-2"}>
                    <Typography variant={"caption"}
                        color={"secondary"}
                        className={"mb-2"}>
                        ● Create from JSON configuration:
                    </Typography>

                    <Button
                        variant={"outlined"}
                        onClick={() => setJsonImportOpen(true)}
                        startIcon={<CodeIcon size="small" />}
                    >
                        Paste JSON Configuration
                    </Button>

                    <CollectionJsonImportDialog
                        open={jsonImportOpen}
                        onClose={() => setJsonImportOpen(false)}
                        onImport={(collection) => {
                            setValues(collection);
                            onContinue();
                        }}
                    />
                </div>

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
                    "text-text-secondary dark:text-text-secondary-dark",
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
