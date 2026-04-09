import { AIIcon } from "@rebasepro/core";
;
import React, { useState } from "react";
;
import { EntityCollection } from "@rebasepro/types";
import { Button, Card, Chip, cls, CodeIcon, Container, Icon, Tooltip, Typography, } from "@rebasepro/ui";
import { CollectionJsonImportDialog } from "./CollectionJsonImportDialog";

import { productsCollectionTemplate } from "./templates/products_template";
import { blogCollectionTemplate } from "./templates/blog_template";
import { usersCollectionTemplate } from "./templates/users_template";
import { ImportFileUpload } from "@rebasepro/data_import";
import { pagesCollectionTemplate } from "./templates/pages_template";
import { useFormex } from "@rebasepro/formex";
import { useCollectionEditorController } from "../../useCollectionEditorController";
import { AICollectionGeneratorPopover } from "./AICollectionGeneratorPopover";
import { CollectionGenerationCallback } from "../../api/generateCollectionApi";
import { prettifyIdentifier } from "@rebasepro/utils";

export function CollectionEditorWelcomeView({
    path,
    parentCollection,
    onContinue,
    existingCollectionPaths,
    generateCollection,
    onAnalyticsEvent,
    unmappedTables,
    onImportFromTable
}: {
    path: string;
    parentCollection?: EntityCollection;
    onContinue: (importData?: object[], propertiesOrder?: string[]) => void;
    existingCollectionPaths?: string[];
    generateCollection?: CollectionGenerationCallback;
    onAnalyticsEvent?: (event: string, params?: object) => void;
    unmappedTables?: string[];
    onImportFromTable?: (tableName: string) => void;
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
    const [importingTable, setImportingTable] = useState<string | null>(null);

    // Filter unmapped tables that aren't already mapped
    const filteredUnmappedTables = (unmappedTables ?? []).filter(
        t => !(existingCollectionPaths ?? []).find(c => c.trim().toLowerCase() === t.trim().toLowerCase())
    );

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <div
                    className="flex flex-row py-2 pt-3 items-center">
                    <Typography variant={"h4"} className={"grow"}>
                        New collection
                    </Typography>
                </div>

                {parentCollection && <Chip colorScheme={"tealDarker"}>
                    <Typography variant={"caption"}>
                        This is a subcollection of <b>{parentCollection.name}</b>
                    </Typography>
                </Chip>}

                {filteredUnmappedTables.length > 0 && <div className={"my-2"}>

                    <Typography variant={"caption"}
                        color={"secondary"}>
                        ● Import from an existing database table:
                    </Typography>
                    <div className={"flex flex-wrap gap-x-2 gap-y-1 items-center my-2 min-h-7"}>

                        {filteredUnmappedTables.map((tableName) => (
                            <Chip key={tableName}
                                colorScheme={"purpleLighter"}
                                onClick={() => {
                                    if (onImportFromTable) {
                                        setImportingTable(tableName);
                                        onImportFromTable(tableName);
                                    } else {
                                        // Fallback: just set path/name like pathSuggestions
                                        setFieldValue("name", prettifyIdentifier(tableName));
                                        setFieldValue("id", tableName);
                                        setFieldValue("path", tableName);
                                        onContinue();
                                    }
                                }}
                                size="small">
                                <Icon iconKey={"table"} size={"smallest"} />
                                {importingTable === tableName ? "Loading..." : tableName}
                            </Chip>
                        ))}

                    </div>

                </div>}

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
                <div className="flex flex-row gap-8">

                    {generateCollection && (
                        <div className={"my-2"}>
                            <Typography variant={"caption"}
                                color={"secondary"}
                                className={"mb-2"}>
                                ● Describe your collection to AI:
                            </Typography>

                            <AICollectionGeneratorPopover
                                onGenerated={(generatedCollection) => {
                                    setValues(generatedCollection);
                                    onContinue();
                                }}
                                generateCollection={generateCollection}
                                onAnalyticsEvent={onAnalyticsEvent}
                                trigger={
                                    <Button
                                        variant="filled"
                                        color="neutral"
                                        startIcon={<AIIcon size="small" />}
                                    >
                                        Generate with AI
                                    </Button>
                                }
                            />
                        </div>
                    )}

                    <div className={"my-2"}>
                        <Typography variant={"caption"}
                            color={"secondary"}
                            className={"mb-2"}>
                            ● Create from JSON configuration:
                        </Typography>

                        <Button
                            variant="filled"
                            color="neutral"
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
                        color={"secondary"}>
                        ● Select a template:
                    </Typography>

                    <div className={"flex gap-2"}>
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
    icon: React.ReactNode | any,
    subtitle: string,
    onClick?: () => void
}) {

    return (
        <Tooltip title={subtitle}
            asChild={true}>
            <Card
                onClick={onClick}
                className={cls(
                    "my-2 rounded-md border px-4 py-3 focus:outline-none transition ease-in-out duration-150 flex flex-row gap-4 items-center",
                    "text-text-secondary dark:text-text-secondary-dark",
                    "hover:border-primary-dark hover:text-primary-dark dark:hover:text-primary focus:ring-primary hover:ring-1 hover:ring-primary",
                    "border-surface-400 dark:border-surface-600 "
                )}
            >
                {icon}
                <div className={"flex flex-col items-start"}>

                    <Typography variant={"subtitle2"}>
                        {title}
                    </Typography>

                </div>
            </Card>
        </Tooltip>
    );

}
