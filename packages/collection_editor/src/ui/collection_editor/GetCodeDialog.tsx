import { EntityCollection, useSnackbarController } from "@firecms/core";
import { Button, ContentCopyIcon, Dialog, DialogActions, DialogContent, Typography, } from "@firecms/ui";
import React from "react";
import JSON5 from "json5";
import { Highlight, themes } from "prism-react-renderer"
import { camelCase } from "./utils/strings";

export function GetCodeDialog({ collection, onOpenChange, open }: { onOpenChange: (open: boolean) => void, collection: any, open: any }) {

    const snackbarController = useSnackbarController();

    const code = "import { EntityCollection } from \"firecms\";\n\nconst " + (collection.name ? camelCase(collection.name) : "my") + "Collection:EntityCollection = " + JSON5.stringify(collectionToCode(collection), null, "\t");
    return <Dialog open={open}
                   onOpenChange={onOpenChange}
                   maxWidth={"4xl"}>
        <DialogContent>
            <Typography variant={"h6"} className={"my-4"}>
                Code for {collection.name}
            </Typography>
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
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
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

    const propertyCleanup = (property: any) => {

        const updatedProperty = {
            ...property
        };

        delete updatedProperty.fromBuilder;
        delete updatedProperty.resolved;
        delete updatedProperty.propertiesOrder;
        delete updatedProperty.editable;

        if (updatedProperty.type === "map") {
            return {
                ...updatedProperty,
                properties: updatedProperty.properties.map(propertyCleanup)
            }
        }
        return updatedProperty;
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
        properties: Object.entries(collection.properties ?? {})
            .map(([key, value]) => ({
                [key]: propertyCleanup(value)
            }))
            .reduce((a, b) => ({ ...a, ...b }), {}),
        subcollections: (collection.subcollections ?? []).map(collectionToCode)
    }

}
