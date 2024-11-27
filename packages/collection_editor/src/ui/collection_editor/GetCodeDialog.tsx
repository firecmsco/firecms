import { EntityCollection, isEmptyObject, useSnackbarController } from "@firecms/core";
import { Button, ContentCopyIcon, Dialog, DialogActions, DialogContent, DialogTitle, Typography, } from "@firecms/ui";
import React from "react";
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

    const code = collection
        ? "import { EntityCollection } from \"@firecms/core\";\n\nconst " + (collection?.name ? camelCase(collection.name) : "my") + "Collection:EntityCollection = " + JSON5.stringify(collectionToCode({ ...collection }), null, "\t")
        : "No collection selected";
    return <Dialog open={open}
                   onOpenChange={onOpenChange}
                   maxWidth={"4xl"}>
        <DialogTitle variant={"h6"}>Code for {collection.name}</DialogTitle>
        <DialogContent>

            <Typography variant={"body2"} className={"my-4 mb-8"}>
                If you want to customise the collection in code, you can add this collection code to your CMS
                app configuration.
                More info in the <a
                rel="noopener noreferrer"
                href={"https://firecms.co/docs/customization_quickstart"}>docs</a>.
            </Typography>
            <Highlight
                theme={themes.vsDark}
                code={code}
                language="typescript"
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
                        message: `Copied`
                    })
                    return navigator.clipboard.writeText(code);
                }}>
                <ContentCopyIcon size={"small"}/>
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
            .reduce((a, b) => ({ ...a, ...b }), {}),
        subcollections: (collection.subcollections ?? []).map(collectionToCode)
    }

}
