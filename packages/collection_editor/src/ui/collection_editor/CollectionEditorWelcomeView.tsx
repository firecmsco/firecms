import React, { useState } from "react";
import { AIIcon, EntityCollection, prettifyIdentifier, useTranslation } from "@firecms/core";
import { Button, Card, Chip, cls, CodeIcon, Container, Icon, Tooltip, Typography, } from "@firecms/ui";
import { CollectionJsonImportDialog } from "./CollectionJsonImportDialog";

import { productsCollectionTemplate } from "./templates/products_template";
import { blogCollectionTemplate } from "./templates/blog_template";
import { usersCollectionTemplate } from "./templates/users_template";
import { ImportFileUpload } from "@firecms/data_import";
import { pagesCollectionTemplate } from "./templates/pages_template";
import { useFormex } from "@firecms/formex";
import { useCollectionEditorController } from "../../useCollectionEditorController";
import { AICollectionGeneratorPopover } from "./AICollectionGeneratorPopover";
import { CollectionGenerationCallback } from "../../api/generateCollectionApi";

export function CollectionEditorWelcomeView({
    path,
    parentCollection,
    onContinue,
    existingCollectionPaths,
    generateCollection,
    onAnalyticsEvent
}: {
    path: string;
    parentCollection?: EntityCollection;
    onContinue: (importData?: object[], propertiesOrder?: string[]) => void;
    existingCollectionPaths?: string[];
    generateCollection?: CollectionGenerationCallback;
    onAnalyticsEvent?: (event: string, params?: object) => void;
}) {

    const { pathSuggestions } = useCollectionEditorController();
    const { t } = useTranslation();

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
                        {t("new_collection")}
                    </Typography>
                </div>

                {parentCollection && <Chip colorScheme={"tealDarker"}>
                    <Typography variant={"caption"}>
                        {t("this_is_subcollection_of")} <b>{parentCollection.name}</b>
                    </Typography>
                </Chip>}

                {(filteredSuggestions ?? []).length > 0 && <div className={"my-2"}>

                    <Typography variant={"caption"}
                        color={"secondary"}>
                        ● {t("use_existing_paths_database")}
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
                                ● {t("describe_collection_ai")}
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
                                        variant="outlined"
                                        startIcon={<AIIcon size="small" />}
                                    >
                                        {t("generate_with_ai")}
                                    </Button>
                                }
                            />
                        </div>
                    )}

                    <div className={"my-2"}>
                        <Typography variant={"caption"}
                            color={"secondary"}
                            className={"mb-2"}>
                            ● {t("create_from_json_config")}
                        </Typography>

                        <Button
                            variant={"outlined"}
                            onClick={() => setJsonImportOpen(true)}
                            startIcon={<CodeIcon size="small" />}
                        >
                            {t("paste_json_config")}
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
                        ● {t("create_collection_from_file_formats")}
                    </Typography>

                    <ImportFileUpload onDataAdded={(data, propertiesOrder) => onContinue(data, propertiesOrder)} />

                </div>}

                <div className={"my-2"}>
                    <Typography variant={"caption"}
                        color={"secondary"}>
                        ● {t("select_template")}
                    </Typography>

                    <div className={"flex gap-2"}>
                        <TemplateButton title={t("products")}
                            subtitle={t("collection_products_subtitle")}
                            icon={<Icon size={"small"}
                                iconKey={productsCollectionTemplate.icon! as string} />}
                            onClick={() => {
                                setValues(productsCollectionTemplate);
                                onContinue();
                            }} />
                        <TemplateButton title={t("users")}
                            subtitle={t("collection_users_subtitle")}
                            icon={<Icon size={"small"} iconKey={usersCollectionTemplate.icon! as string} />}
                            onClick={() => {
                                setValues(usersCollectionTemplate);
                                onContinue();
                            }} />
                        <TemplateButton title={t("blog_posts")}
                            subtitle={t("collection_blog_posts_subtitle")}
                            icon={<Icon size={"small"} iconKey={blogCollectionTemplate.icon! as string} />}
                            onClick={() => {
                                setValues(blogCollectionTemplate);
                                onContinue();
                            }} />
                        <TemplateButton title={t("pages")}
                            subtitle={t("collection_pages_subtitle")}
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
