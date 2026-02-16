import { EntityCollection, isEmptyObject, useSnackbarController } from "@firecms/core";
import { Button, ContentCopyIcon, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, Typography } from "@firecms/ui";
import React, { useState } from "react";
import JSON5 from "json5";
import { Highlight, themes } from "prism-react-renderer"
import { camelCase } from "./utils/strings";
import { clone } from "@firecms/formex";

export function GetCodeDialog({
    collection,
    onOpenChange,
    open
}: { onOpenChange: (open: boolean) => void, collection: any, open: any }) {

    const snackbarController = useSnackbarController();
    const [format, setFormat] = useState<"ts" | "json">("json");

    const collectionData = collectionToCode({ ...collection });

    const tsCode = collection
        ? "import { EntityCollection } from \"@firecms/core\";\n\nconst " + (collection?.name ? camelCase(collection.name) : "my") + "Collection:EntityCollection = " + JSON5.stringify(collectionData, null, "\t")
        : "No collection selected";

    const jsonCode = collection
        ? JSON.stringify(collectionData, null, 2)
        : "No collection selected";

    const code = format === "ts" ? tsCode : jsonCode;

    return <Dialog open={open}
        onOpenChange={onOpenChange}
        maxWidth={"4xl"}>
        <div className="flex items-center justify-between pr-6">
            <DialogTitle variant={"h6"}>Code for {collection.name}</DialogTitle>
            <Tabs value={format} onValueChange={(v) => setFormat(v as "ts" | "json")}>
                <Tab value="ts">TypeScript</Tab>
                <Tab value="json">JSON</Tab>
            </Tabs>
        </div>
        <DialogContent>

            <Typography variant={"body2"} className={"mb-4"}>
                {format === "json"
                    ? "Use this config to define the collection in JSON format."
                    : <>
                        If you want to customise the collection in code, you can add this collection code to your CMS
                        app configuration.
                        More info in the <a
                            rel="noopener noreferrer"
                            href={"https://firecms.co/docs/cloud/quickstart"}>docs</a>.
                    </>}
            </Typography>
            <Highlight
                theme={themes.vsDark}
                code={code}
                language={format === "ts" ? "typescript" : "json"}
            >
                {({
                    className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps
                }) => (
                    <pre style={style} className={"p-4 rounded text-sm"}>
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token })} />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>

        </DialogContent>
        <DialogActions>
            <Button
                variant={"text"}
                size={"small"}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    snackbarController.open({
                        type: "success",
                        message: "Copied"
                    })
                    return navigator.clipboard.writeText(code);
                }}>
                <ContentCopyIcon size={"small"} />
                Copy to clipboard
            </Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogActions>
    </Dialog>;
}

function collectionToCode(collection: EntityCollection): object {

    const propertyCleanup = (value: any): any => {
        if (value === undefined || value === null) {
            return value;
        }
        const valueCopy = clone(value);
        if (typeof valueCopy === "function") {
            return valueCopy;
        }
        if (Array.isArray(valueCopy)) {
            return valueCopy.map((v: any) => propertyCleanup(v));
        }
        if (typeof valueCopy === "object") {
            if (valueCopy === null)
                return valueCopy;
            Object.keys(valueCopy).forEach((key) => {
                if (!isEmptyObject(valueCopy)) {
                    const childRes = propertyCleanup(valueCopy[key]);
                    if (childRes !== null && childRes !== undefined && childRes !== false && !isEmptyObject(childRes)) {
                        valueCopy[key] = childRes;
                    } else {
                        delete valueCopy[key];
                    }
                }
            });
            delete valueCopy.fromBuilder;
            delete valueCopy.resolved;
            delete valueCopy.propertiesOrder;
            delete valueCopy.propertyConfig;
            delete valueCopy.resolvedProperties;
            delete valueCopy.editable;

        }

        return valueCopy;
    }

    return {
        id: collection.id,
        name: collection.name,
        singularName: collection.singularName,
        path: collection.path,
        description: collection.description,
        editable: true,
        collectionGroup: collection.collectionGroup,
        icon: collection.icon,
        group: collection.group,
        customId: collection.customId,
        initialFilter: collection.initialFilter,
        initialSort: collection.initialSort,
        properties: Object.entries({
            ...(collection.properties ?? {})
        })
            .map(([key, value]) => ({
                [key]: propertyCleanup(value)
            }))
            .reduce((a, b) => ({
                ...a,
                ...b
            }), {}),
        subcollections: (collection.subcollections ?? []).map(collectionToCode)
    }

}
