import { commentOn, formatKey, Raw, toFileName, toIdentifier } from "./codegen";
import { RowyColumn, RowyConfig, RowySchema, RowyTableSettings } from "./types";

/**
 * Converts Rowy's table configuration into FireCMS collection configs.
 *
 * Pure: it gets the configuration Rowy keeps under `_rowy_` and returns what to write.
 * It never sees document data. Every column that cannot be carried over exactly gets a
 * finding, so the report says what is left to do instead of the gap closing silently.
 */

export type FindingLevel = "todo" | "review" | "info";

export type Finding = {
    tableId: string;
    /** Field key of the column, when the finding is about one */
    column?: string;
    level: FindingLevel;
    message: string;
};

export type ScriptFile = {
    /** Relative to the output folder */
    path: string;
    tableId: string;
    description: string;
    code: string;
};

export type ColumnSummary = {
    fieldName: string;
    name: string;
    rowyType: string;
    /** What the column became in FireCMS, or why it did not */
    firecms: string;
};

export type ConvertedCollection = {
    tableId: string;
    tableName: string;
    variableName: string;
    fileName: string;
    collection: Record<string, unknown>;
    columns: ColumnSummary[];
};

export type RoleSummary = {
    role: string;
    /** Tables the role could see */
    visibleIn: string[];
    /** Tables whose columns the role could change */
    modifies: string[];
};

export type ExtensionSummary = {
    tableId: string;
    name: string;
    type: string;
    active: boolean;
    triggers: string[];
    replacement: string;
};

export type WebhookSummary = {
    tableId: string;
    name: string;
    type: string;
    active: boolean;
    url?: string;
    /** The webhook had verification settings. They are never copied. */
    hasAuth: boolean;
};

export type ConversionResult = {
    collections: ConvertedCollection[];
    findings: Finding[];
    scripts: ScriptFile[];
    roles: RoleSummary[];
    extensions: ExtensionSummary[];
    webhooks: WebhookSummary[];
    skippedTables: { id: string, reason: string }[];
};

export type ConvertOptions = {
    /** Only convert these table ids */
    tables?: string[];
};

const WHERE_FILTER_OPS = ["<", "<=", "==", "!=", ">=", ">", "array-contains", "in", "not-in", "array-contains-any"];

const EXTENSION_REPLACEMENTS: Record<string, string> = {
    historySnapshot: "FireCMS entity history: set `history: true` on the collection (FireCMS Cloud, or the PRO entity history plugin).",
    algoliaIndex: "The official Algolia Firebase Extension, or a Cloud Function. FireCMS can search the index through a `textSearchController`.",
    meiliIndex: "A Cloud Function that syncs Meilisearch. FireCMS can search the index through a `textSearchController`.",
    bigqueryIndex: "The official \"Stream Firestore to BigQuery\" Firebase Extension.",
    sendgridEmail: "The official \"Trigger Email from Firestore\" Firebase Extension, or a Cloud Function.",
    docSync: "A Cloud Function with a Firestore trigger that copies the fields."
};
const DEFAULT_EXTENSION_REPLACEMENT = "A Cloud Function with a Firestore trigger. Keep secrets in Secret Manager.";

type TableContext = {
    tableId: string;
    tableName: string;
    scriptDir: string;
    /** Name of the Cloud Function Rowy built for this table, when known */
    rowyFunctionName?: string;
    findings: Finding[];
    scripts: ScriptFile[];
};

export function convertRowyConfig(config: RowyConfig, options: ConvertOptions = {}): ConversionResult {
    const result: ConversionResult = {
        collections: [],
        findings: [],
        scripts: [],
        roles: [],
        extensions: [],
        webhooks: [],
        skippedTables: []
    };

    const allTables = config.settings.tables ?? [];
    const tables = options.tables
        ? allTables.filter(table => options.tables!.includes(table.id))
        : allTables;

    for (const id of options.tables ?? []) {
        if (!allTables.some(table => table.id === id)) {
            result.skippedTables.push({ id, reason: "No Rowy table has this id." });
        }
    }

    const usedFileNames = new Set<string>();
    for (const table of tables) {
        const isGroup = table.tableType === "collectionGroup";
        const schema = (isGroup ? config.groupSchemas : config.schemas)[table.id];
        if (!schema) {
            result.skippedTables.push({
                id: table.id,
                reason: `Rowy lists this table, but its schema document (_rowy_/settings/${isGroup ? "groupSchema" : "schema"}/${table.id}) does not exist.`
            });
            continue;
        }

        const fileName = uniqueName(toFileName(table.id), usedFileNames);
        const ctx: TableContext = {
            tableId: table.id,
            tableName: table.name || table.id,
            scriptDir: `rowy-scripts/${fileName}`,
            rowyFunctionName: isGroup ? undefined : rowyFunctionName(table.collection),
            findings: result.findings,
            scripts: result.scripts
        };

        const { collection, columns } = convertTable(table, schema, ctx);
        result.collections.push({
            tableId: table.id,
            tableName: ctx.tableName,
            variableName: `${toIdentifier(fileName)}Collection`,
            fileName,
            collection,
            columns
        });

        convertExtensions(schema, ctx, result.extensions);
        convertWebhooks(table, schema, config, ctx, result.webhooks);
    }

    result.roles = summarizeRoles(tables);
    return result;
}

function convertTable(table: RowyTableSettings, schema: RowySchema, ctx: TableContext) {
    const isGroup = table.tableType === "collectionGroup";
    const { properties, propertiesOrder, subcollections, columns } = convertColumns(schema, ctx, table);

    const collection: Record<string, unknown> = {
        id: table.id,
        name: table.name || table.id,
        path: table.collection,
        collectionGroup: isGroup ? true : undefined,
        group: table.section || undefined,
        description: table.description || undefined,
        customId: idTypeToCustomId(schema, ctx),
        permissions: table.readOnly ? { read: true, create: false, edit: false, delete: false } : undefined,
        initialSort: convertSort(schema, properties, ctx),
        initialFilter: convertFilters(schema, properties, ctx),
        // Shows every field of a document, including the ones Rowy managed that have no property here
        includeJsonView: true,
        properties,
        propertiesOrder,
        subcollections: subcollections.length > 0 ? subcollections : undefined,
        callbacks: table.audit !== false ? auditCallbacks(table) : undefined
    };

    if (table.readOnly) {
        addFinding(ctx, undefined, "info", "The table was read-only in Rowy. The collection blocks create, edit and delete for everyone.");
    }
    if (table.audit !== false) {
        addFinding(ctx, undefined, "info",
            `Rowy recorded who created and last changed each row in \`${table.auditFieldCreatedBy || "_createdBy"}\` and \`${table.auditFieldUpdatedBy || "_updatedBy"}\`. ` +
            "The generated `onPreSave` callback keeps writing them. Remove it if nothing reads those fields.");
    }

    return { collection, columns };
}

function convertColumns(schema: RowySchema, ctx: TableContext, table?: RowyTableSettings) {
    const properties: Record<string, any> = {};
    const propertiesOrder: string[] = [];
    const subcollections: Record<string, unknown>[] = [];
    const columns: ColumnSummary[] = [];

    const sortedColumns = Object.values(schema.columns ?? {})
        .filter(column => column && typeof column.fieldName === "string" && column.fieldName.length > 0)
        .sort((a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER));

    for (const column of sortedColumns) {
        const name = column.name || column.fieldName;
        const summary: ColumnSummary = { fieldName: column.fieldName, name, rowyType: column.type, firecms: "" };
        columns.push(summary);

        if (column.type === "SUB_TABLE") {
            subcollections.push(convertSubTable(column, schema, ctx));
            summary.firecms = `subcollection \`${column.fieldName}\``;
            continue;
        }

        const converted = convertColumn(column, schema, ctx, table);
        summary.firecms = converted.summary;
        if (!converted.property) continue;

        applyColumnSettings(converted.property, column, ctx);
        const placed = placeProperty(properties, propertiesOrder, column.fieldName, converted.property);
        if (!placed) {
            summary.firecms = "not converted";
            addFinding(ctx, column.fieldName, "review",
                `\`${column.fieldName}\` clashes with another column's field. Only the first one was converted.`);
        }
    }

    return { properties, propertiesOrder, subcollections, columns };
}

type ConvertedColumn = {
    property?: Record<string, any>;
    summary: string;
};

function convertColumn(column: RowyColumn, schema: RowySchema, ctx: TableContext, table?: RowyTableSettings): ConvertedColumn {
    const config = column.config ?? {};
    const name = column.name || column.fieldName;
    const field = column.fieldName;

    switch (column.type) {
        case "SIMPLE_TEXT":
            return { property: { dataType: "string", name }, summary: "string" };
        case "LONG_TEXT":
            return { property: { dataType: "string", name, multiline: true }, summary: "string (multiline)" };
        case "RICH_TEXT":
            addFinding(ctx, field, "review",
                "Rowy stored this as HTML. It is shown as plain multiline text so the HTML is not rewritten on save. " +
                "Use `markdown: true` only if everything that reads the field accepts markdown.");
            return { property: { dataType: "string", name, multiline: true }, summary: "string (multiline, holds HTML)" };
        case "EMAIL":
            return { property: { dataType: "string", name, email: true }, summary: "string (email)" };
        case "PHONE_NUMBER":
            return { property: { dataType: "string", name }, summary: "string" };
        case "URL":
            return { property: { dataType: "string", name, url: true }, summary: "string (url)" };
        case "CODE":
            return { property: { dataType: "string", name, multiline: true }, summary: "string (multiline)" };
        case "MARKDOWN":
            return { property: { dataType: "string", name, markdown: true }, summary: "string (markdown)" };

        case "SINGLE_SELECT":
            noteFreeText(config, ctx, field);
            return {
                property: { dataType: "string", name, enumValues: toEnumValues(config.options) },
                summary: "string (enum)"
            };
        case "MULTI_SELECT":
            noteFreeText(config, ctx, field);
            return {
                property: { dataType: "array", name, of: { dataType: "string", enumValues: toEnumValues(config.options) } },
                summary: "array of string (enum)"
            };

        case "CHECK_BOX":
            return { property: { dataType: "boolean", name }, summary: "boolean" };
        case "NUMBER":
            return { property: { dataType: "number", name }, summary: "number" };
        case "PERCENTAGE":
            addFinding(ctx, field, "review", "Rowy stores percentages as fractions (0.25 is 25%). Editors now type the fraction.");
            return {
                property: { dataType: "number", name, description: "A fraction: 0.25 means 25%." },
                summary: "number (fraction)"
            };
        case "RATING":
            return {
                property: { dataType: "number", name, validation: { min: 0, max: numberOr(config.max, 5) } },
                summary: "number"
            };
        case "SLIDER": {
            const unit = typeof config.unit === "string" && config.unit ? `Unit: ${config.unit}.` : undefined;
            return {
                property: {
                    dataType: "number",
                    name,
                    description: unit,
                    validation: { min: numberOr(config.min, 0), max: numberOr(config.max, 10) }
                },
                summary: "number"
            };
        }
        case "COLOR":
            addFinding(ctx, field, "review",
                "Rowy stored colors as `{ hex, rgb, hsv }`. The field is read-only, because editing `hex` alone would leave `rgb` and `hsv` stale. " +
                "Add a custom field if editors need to change it.");
            return {
                property: {
                    dataType: "map",
                    name,
                    readOnly: true,
                    properties: { hex: { dataType: "string", name: "Hex" } },
                    previewProperties: ["hex"]
                },
                summary: "map (read-only)"
            };
        case "GEO_POINT":
            return { property: { dataType: "geopoint", name }, summary: "geopoint" };

        case "DATE":
            return { property: { dataType: "date", name, mode: "date" }, summary: "date" };
        case "DATE_TIME":
            return { property: { dataType: "date", name, mode: "date_time" }, summary: "date (date_time)" };
        case "DURATION":
            return {
                property: {
                    dataType: "map",
                    name,
                    properties: {
                        start: { dataType: "date", name: "Start", mode: "date_time" },
                        end: { dataType: "date", name: "End", mode: "date_time" }
                    }
                },
                summary: "map { start, end }"
            };

        case "IMAGE":
        case "FILE":
            addFinding(ctx, field, "todo",
                "Rowy stored files as a list of `{ downloadURL, ref, name, type, lastModifiedTS }`. The field is read-only. " +
                "To upload from FireCMS, change the stored value to the list of `ref` paths and use the `storage` property in the comment above it. " +
                "The migration report shows how.");
            return {
                property: commentOn(rowyFilesProperty(name, column.type === "IMAGE"),
                    "TODO(rowy): read-only until the stored values are storage paths. Then replace this property with:",
                    `{ dataType: "array", name: ${JSON.stringify(name)}, of: { dataType: "string", storage: {`,
                    `    storagePath: "{path}/{entityId}/{propertyKey}", fileName: "{rand}-{file}"${column.type === "IMAGE" ? ", acceptedFiles: [\"image/*\"]" : ""}`,
                    "} } }"),
                summary: "array of file metadata (read-only)"
            };

        case "REFERENCE":
            addFinding(ctx, field, "review",
                "Rowy did not record which collection this reference points to. Set `path` on the property to make it editable; until then it is read-only.");
            return { property: { dataType: "reference", name }, summary: "reference (read-only until `path` is set)" };

        case "DOCUMENT_SELECT":
        case "SERVICE_SELECT": {
            const target = config.index ? ` It searched the Algolia index \`${config.index}\`.` : "";
            addFinding(ctx, field, "todo",
                "Rowy stored copies of the linked documents, as `{ docPath, snapshot }`, and its table Cloud Function kept the copies in sync." + target +
                " The field is read-only here. To edit links in FireCMS, convert the values to document references and use a `reference` property.");
            const linked = {
                dataType: "map",
                properties: {
                    docPath: { dataType: "string", name: "Document path" },
                    snapshot: { dataType: "map", name: "Copied fields", keyValue: true }
                },
                previewProperties: ["docPath"]
            };
            const multiple = config.multiple !== false;
            return {
                property: multiple
                    ? { dataType: "array", name, readOnly: true, of: linked }
                    : { ...linked, name, readOnly: true },
                summary: "linked documents (read-only)"
            };
        }

        case "ARRAY_SUB_TABLE": {
            const subSchema = schema.subTables?.[field];
            if (!subSchema?.columns || Object.keys(subSchema.columns).length === 0) {
                addFinding(ctx, field, "review", "Rowy has no column settings for this array sub-table. It was not converted; the JSON tab shows it.");
                return { summary: "not converted" };
            }
            const inner = convertColumns(subSchema, { ...ctx, tableId: `${ctx.tableId}/${field}` });
            return {
                property: {
                    dataType: "array",
                    name,
                    of: { dataType: "map", properties: inner.properties, propertiesOrder: inner.propertiesOrder }
                },
                summary: "array of map"
            };
        }

        case "JSON":
            return { property: { dataType: "map", name, keyValue: true }, summary: "map (key-value)" };

        case "DERIVATIVE":
        case "AGGREGATE": {
            const code = config.derivativeFn ?? config.script;
            if (code) addScript(ctx, field, "derivative", `Derivative for column "${name}"`, code);
            addFinding(ctx, field, "todo",
                `Calculated by ${functionLabel(ctx)} when a row changes. That function keeps running after you switch, ` +
                "until you delete it. Port the script to your own Cloud Function before you remove Rowy." +
                (listOf(config.listenerFields) ? ` It listened to: ${listOf(config.listenerFields)}.` : ""));
            return convertRendered(column, schema, ctx, table, "calculated by a Cloud Function");
        }

        case "FORMULA": {
            if (config.formulaFn) addScript(ctx, field, "formula", `Formula for column "${name}"`, config.formulaFn);
            addFinding(ctx, field, "todo",
                "Rowy computed this formula in the browser and never stored it. Recreate it as an `additionalFields` entry on the collection.");
            return { summary: "not converted (computed in the browser)" };
        }

        case "ACTION": {
            const code = config.runFn ?? config.script;
            if (code) addScript(ctx, field, "action", `Action for column "${name}"`, code);
            if (config.undoFn ?? config.undo?.script) addScript(ctx, field, "action-undo", `Undo of action "${name}"`, config.undoFn ?? config.undo.script);
            const callable = !config.isActionScript && typeof config.callableName === "string" && config.callableName
                ? ` It calls your callable function \`${config.callableName}\`, which a FireCMS entity action can call with \`httpsCallable\`.`
                : " Its script ran on Rowy Run, the `rowy-backend` Cloud Run service. Move it to a callable Cloud Function and call that from a FireCMS entity action.";
            addFinding(ctx, field, "todo", `Action button "${name}".` + callable);
            return {
                property: {
                    dataType: "map",
                    name,
                    readOnly: true,
                    properties: { status: { dataType: "string", name: "Status" } },
                    previewProperties: ["status"]
                },
                summary: "map (last run status, read-only)"
            };
        }

        case "STATUS": {
            const conditions: { type?: string, value?: unknown, label?: string }[] = Array.isArray(config.conditions) ? config.conditions : [];
            const stringConditions = conditions.filter(c => c?.type === "string" && typeof c.value === "string");
            if (stringConditions.length > 0 && stringConditions.length === conditions.filter(c => c?.type !== "null" && c?.type !== "undefined").length) {
                return {
                    property: {
                        dataType: "string",
                        name,
                        readOnly: true,
                        enumValues: dedupe(stringConditions.map(c => ({ id: c.value as string, label: c.label || (c.value as string) })))
                    },
                    summary: "string (enum, read-only)"
                };
            }
            addFinding(ctx, field, "review", "Status labels based on numbers or other conditions were not converted. The JSON tab shows the value.");
            return { summary: "not converted" };
        }

        case "CONNECTOR":
            if (config.connectorFn) addScript(ctx, field, "connector", `Connector for column "${name}"`, config.connectorFn);
            addFinding(ctx, field, "todo",
                "Connector columns fetched their options with a function on Rowy Run. Recreate the picker as a FireCMS custom field.");
            return { summary: "not converted" };

        case "CREATED_BY":
        case "UPDATED_BY":
        case "USER":
            if (column.type === "USER") {
                addFinding(ctx, field, "review",
                    "Rowy stored a copy of the user, like `{ uid, email, displayName }`. It is read-only here. " +
                    "FireCMS can pick users with `userSelect` on a string property, which stores only the user ID.");
            }
            return { property: userProperty(name), summary: "map (user, read-only)" };

        case "CREATED_AT":
        case "UPDATED_AT":
            return {
                property: { dataType: "date", name, mode: "date_time", readOnly: true },
                summary: "date (read-only)"
            };

        case "ID":
            addFinding(ctx, field, "info", "The ID column was not converted: FireCMS always shows the document ID.");
            return { summary: "shown by FireCMS" };
        case "LAST":
            return { summary: "not needed" };
        case "ARRAY":
            addFinding(ctx, field, "review", "Rowy did not record what this array holds. It was not converted; the JSON tab shows it.");
            return { summary: "not converted" };

        default:
            addFinding(ctx, field, "review", `Unknown Rowy field type \`${column.type}\`. It was not converted; the JSON tab shows it.`);
            return { summary: "not converted" };
    }
}

/**
 * Derivative and aggregate columns are displayed as another field type.
 */
function convertRendered(column: RowyColumn, schema: RowySchema, ctx: TableContext, table: RowyTableSettings | undefined, why: string): ConvertedColumn {
    const renderFieldType = column.config?.renderFieldType;
    if (!renderFieldType || ["DERIVATIVE", "AGGREGATE", "ACTION", "FORMULA"].includes(renderFieldType)) {
        addFinding(ctx, column.fieldName, "review", "Rowy did not record how this value is displayed. It was not converted; the JSON tab shows it.");
        return { summary: "not converted" };
    }
    // Findings for the displayed type are about editing, which does not apply to a calculated value
    const quiet: TableContext = { ...ctx, findings: [], scripts: [] };
    const rendered = convertColumn({ ...column, type: renderFieldType, config: {} }, schema, quiet, table);
    if (!rendered.property) return { summary: "not converted" };
    rendered.property.readOnly = true;
    return { property: rendered.property, summary: `${rendered.summary}, read-only, ${why}` };
}

function convertSubTable(column: RowyColumn, schema: RowySchema, ctx: TableContext): Record<string, unknown> {
    const subSchema = schema.subTables?.[column.fieldName] ?? {};
    const subCtx: TableContext = {
        ...ctx,
        tableId: `${ctx.tableId}/${column.fieldName}`,
        scriptDir: `${ctx.scriptDir}/${toFileName(column.fieldName)}`
    };
    if (!subSchema.columns) {
        addFinding(subCtx, undefined, "review", "Rowy has no column settings for this sub-table. The subcollection has no properties; the JSON tab shows each document.");
    }
    const { properties, propertiesOrder, subcollections } = convertColumns(subSchema, subCtx);
    convertExtensions(subSchema, subCtx, []);
    return {
        id: column.fieldName,
        name: column.name || column.fieldName,
        path: column.fieldName,
        customId: idTypeToCustomId(subSchema, subCtx),
        initialSort: convertSort(subSchema, properties, subCtx),
        includeJsonView: true,
        properties,
        propertiesOrder,
        subcollections: subcollections.length > 0 ? subcollections : undefined
    };
}

/**
 * Settings that every Rowy column can have.
 */
function applyColumnSettings(property: Record<string, any>, column: RowyColumn, ctx: TableContext) {
    const config = column.config ?? {};
    const calculated = ["DERIVATIVE", "AGGREGATE", "CREATED_AT", "UPDATED_AT", "CREATED_BY", "UPDATED_BY"].includes(column.type);

    if (column.hidden) property.hideFromCollection = true;
    if (column.editable === false) property.readOnly = true;
    if (typeof column.width === "number") property.columnWidth = Math.round(column.width);

    if (calculated) return;

    const validation: Record<string, unknown> = { ...(property.validation ?? {}) };
    if (config.required === true) validation.required = true;
    if (typeof config.validationRegex === "string" && config.validationRegex && property.dataType === "string") {
        validation.matches = config.validationRegex;
    }
    if (Object.keys(validation).length > 0) property.validation = validation;

    const defaultValue = config.defaultValue;
    if (defaultValue?.type === "static" && isPlainValue(defaultValue.value)) {
        property.defaultValue = defaultValue.value;
    } else if (defaultValue?.type === "null") {
        property.defaultValue = null;
    } else if (defaultValue?.type === "dynamic") {
        const code = defaultValue.dynamicValueFn ?? defaultValue.script;
        if (code) addScript(ctx, column.fieldName, "default-value", `Default value for column "${column.name || column.fieldName}"`, code);
        addFinding(ctx, column.fieldName, "todo",
            `The default value came from a script that ${functionLabel(ctx)} ran when a row was created. ` +
            "Port it to an `onPreSave` callback (for status `new`) or to your own Cloud Function.");
    }
}

/**
 * Put a property at a field key. Rowy keys can be dot paths, which Firestore stores as
 * nested maps, so `_createdBy.timestamp` becomes `timestamp` inside the `_createdBy` map.
 */
function placeProperty(properties: Record<string, any>, order: string[], fieldName: string, property: Record<string, any>): boolean {
    const segments = fieldName.split(".");
    let target = properties;
    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        let parent = target[segment];
        if (!parent) {
            parent = { dataType: "map", name: humanize(segment), properties: {} };
            target[segment] = parent;
            if (i === 0) order.push(segment);
        } else if (parent.dataType !== "map") {
            return false;
        }
        parent.properties = parent.properties ?? {};
        target = parent.properties;
    }

    const key = segments[segments.length - 1];
    const existing = target[key];
    if (!existing) {
        target[key] = property;
        if (segments.length === 1) order.push(key);
        return true;
    }
    if (existing.dataType === "map" && property.dataType === "map") {
        // e.g. a `_createdBy` map made for a "Created at" column, then the "Created by" column itself
        target[key] = {
            ...property,
            properties: { ...(property.properties ?? {}), ...(existing.properties ?? {}) }
        };
        return true;
    }
    if (existing.dataType === property.dataType) {
        // Two columns showing the same field. Keep the first.
        return true;
    }
    return false;
}

function userProperty(name: string) {
    return {
        dataType: "map",
        name,
        readOnly: true,
        properties: {
            displayName: { dataType: "string", name: "Name" },
            email: { dataType: "string", name: "Email", email: true },
            uid: { dataType: "string", name: "User ID" },
            timestamp: { dataType: "date", name: "Time", mode: "date_time" }
        },
        previewProperties: ["displayName", "timestamp"]
    };
}

function rowyFilesProperty(name: string, image: boolean) {
    return {
        dataType: "array",
        name,
        readOnly: true,
        of: {
            dataType: "map",
            properties: {
                downloadURL: { dataType: "string", name: "URL", url: image ? "image" : true },
                name: { dataType: "string", name: "File name" },
                ref: { dataType: "string", name: "Storage path" },
                type: { dataType: "string", name: "Type" }
            },
            previewProperties: ["downloadURL"]
        }
    };
}

/**
 * Rowy's audit fields, kept up to date the way Rowy did.
 */
function auditCallbacks(table: RowyTableSettings) {
    const createdBy = formatKey(table.auditFieldCreatedBy || "_createdBy");
    const updatedBy = formatKey(table.auditFieldUpdatedBy || "_updatedBy");
    return commentOn(new Raw(`{
    onPreSave: ({ values, status, context }) => {
        const user = context.authController.user;
        const audit = {
            timestamp: new Date(),
            uid: user?.uid ?? null,
            email: user?.email ?? null,
            displayName: user?.displayName ?? null,
            photoURL: user?.photoURL ?? null,
            isAnonymous: user?.isAnonymous ?? false
        };
        return status === "existing"
            ? { ...values, ${updatedBy}: audit }
            : { ...values, ${createdBy}: audit, ${updatedBy}: audit };
    }
}`), "Rowy wrote who created and last changed each row. This keeps doing it, so anything that reads these fields keeps working.");
}

function idTypeToCustomId(schema: RowySchema, ctx: TableContext) {
    if (schema.idType === "custom") return true;
    if (schema.idType === "decrement") {
        addFinding(ctx, undefined, "review",
            "Rowy gave new rows decreasing IDs, so the newest sorted first. FireCMS creates random IDs. Sort by a date field instead.");
    }
    return undefined;
}

function convertSort(schema: RowySchema, properties: Record<string, unknown>, ctx: TableContext) {
    const sorts = Array.isArray(schema.sorts) ? schema.sorts : [];
    if (sorts.length === 0) return undefined;
    const [first, ...rest] = sorts;
    if (rest.length > 0) {
        addFinding(ctx, undefined, "info", `Rowy sorted by ${sorts.length} fields. FireCMS starts sorted by the first one, \`${first.key}\`.`);
    }
    if (!first?.key || !(first.key in properties)) return undefined;
    return [first.key, first.direction === "desc" ? "desc" : "asc"];
}

function convertFilters(schema: RowySchema, properties: Record<string, unknown>, ctx: TableContext) {
    const filters = Array.isArray(schema.filters) ? schema.filters : [];
    if (filters.length === 0) return undefined;
    if (schema.joinOperator === "OR") {
        addFinding(ctx, undefined, "review", "Rowy combined this table's filters with OR. FireCMS combines filters with AND, so none were carried over.");
        return undefined;
    }
    const result: Record<string, [string, unknown]> = {};
    const skipped: string[] = [];
    for (const filter of filters) {
        const supported = WHERE_FILTER_OPS.includes(filter.operator) &&
            filter.key in properties &&
            !(filter.key in result) &&
            isPlainValue(filter.value);
        if (supported) {
            result[filter.key] = [filter.operator, filter.value];
        } else {
            skipped.push(`\`${filter.key} ${filter.operator}\``);
        }
    }
    if (skipped.length > 0) {
        addFinding(ctx, undefined, "review", `These Rowy filters have no FireCMS equivalent and were not carried over: ${skipped.join(", ")}.`);
    }
    return Object.keys(result).length > 0 ? result : undefined;
}

function convertExtensions(schema: RowySchema, ctx: TableContext, summaries: ExtensionSummary[]) {
    const extensions = Array.isArray(schema.extensionObjects) ? schema.extensionObjects : [];
    extensions.forEach((extension, i) => {
        const name = extension.name || `${extension.type ?? "extension"} ${i + 1}`;
        const type = extension.type ?? "unknown";
        const replacement = EXTENSION_REPLACEMENTS[type] || DEFAULT_EXTENSION_REPLACEMENT;
        summaries.push({
            tableId: ctx.tableId,
            name,
            type,
            active: extension.active !== false,
            triggers: extension.triggers ?? [],
            replacement
        });
        const code = [
            extension.conditions ? `// Conditions\n${extension.conditions}` : "",
            extension.extensionBody ? `// Extension body\n${extension.extensionBody}` : ""
        ].filter(Boolean).join("\n\n");
        if (code) addScript(ctx, undefined, `extension-${toFileName(name)}`, `Extension "${name}" (${type})`, code);
    });
    if (typeof schema.sparks === "string" && schema.sparks.trim()) {
        addScript(ctx, undefined, "sparks", "Sparks (extensions from before Rowy 2.4)", schema.sparks);
        addFinding(ctx, undefined, "todo", "The table has Sparks, Rowy's old extensions. They run in the table's Cloud Function; port them like extensions.");
    }
    if (extensions.length > 0) {
        addFinding(ctx, undefined, "todo",
            `${extensions.length === 1 ? "1 extension runs" : `${extensions.length} extensions run`} in ${functionLabel(ctx)}. ` +
            `${extensions.length === 1 ? "It keeps" : "They keep"} running until you delete that function. Port ${extensions.length === 1 ? "it" : "them"} before you remove Rowy.`);
    }
}

function convertWebhooks(table: RowyTableSettings, schema: RowySchema, config: RowyConfig, ctx: TableContext, summaries: WebhookSummary[]) {
    const webhooks = Array.isArray(schema.webhooks) ? schema.webhooks : [];
    const hooksUrl = config.settings.services?.hooks;
    webhooks.forEach((webhook, i) => {
        const name = webhook.name || `webhook ${i + 1}`;
        summaries.push({
            tableId: ctx.tableId,
            name,
            type: webhook.type ?? "basic",
            active: webhook.active !== false,
            url: hooksUrl && webhook.endpoint ? `${hooksUrl}/wh/${table.collection}/${webhook.endpoint}` : undefined,
            hasAuth: hasContent(webhook.auth)
        });
        const code = [
            webhook.conditions ? `// Conditions\n${webhook.conditions}` : "",
            webhook.parser ? `// Parser\n${webhook.parser}` : ""
        ].filter(Boolean).join("\n\n");
        // `webhook.auth` holds verification secrets and is never written anywhere
        if (code) addScript(ctx, undefined, `webhook-${toFileName(name)}`, `Webhook "${name}" (${webhook.type ?? "basic"})`, code);
    });
    if (webhooks.length > 0) {
        addFinding(ctx, undefined, "todo",
            `${webhooks.length === 1 ? "1 webhook is" : `${webhooks.length} webhooks are`} served by Rowy's \`rowy-hooks\` Cloud Run service. ` +
            "Recreate each as an HTTPS Cloud Function, then point the sender at the new URL.");
    }
}

function summarizeRoles(tables: RowyTableSettings[]): RoleSummary[] {
    const roles = new Map<string, RoleSummary>();
    const get = (role: string) => {
        if (!roles.has(role)) roles.set(role, { role, visibleIn: [], modifies: [] });
        return roles.get(role)!;
    };
    for (const table of tables) {
        for (const role of table.roles ?? []) get(role).visibleIn.push(table.id);
        for (const role of table.modifiableBy ?? []) get(role).modifies.push(table.id);
    }
    return [...roles.values()].sort((a, b) => a.role.localeCompare(b.role));
}

function addScript(ctx: TableContext, fieldName: string | undefined, kind: string, description: string, code: unknown) {
    if (typeof code !== "string" || !code.trim()) return;
    const base = fieldName ? `${toFileName(fieldName)}.${kind}` : kind;
    let path = `${ctx.scriptDir}/${base}.ts`;
    for (let n = 2; ctx.scripts.some(script => script.path === path); n++) {
        path = `${ctx.scriptDir}/${base}-${n}.ts`;
    }
    ctx.scripts.push({ path, tableId: ctx.tableId, description, code });
}

function addFinding(ctx: TableContext, column: string | undefined, level: FindingLevel, message: string) {
    ctx.findings.push({ tableId: ctx.tableId, column, level, message });
}

function functionLabel(ctx: TableContext) {
    return ctx.rowyFunctionName
        ? `the Cloud Function Rowy built for this table (\`R-${ctx.rowyFunctionName}\`)`
        : "the Cloud Function Rowy built for this table";
}

/**
 * The name Rowy Run gives the table's Cloud Function, inside the `R` group.
 * Mirrors `getFunctionName` in Rowy Run (rowyio/backend, src/functionBuilder/utils.ts).
 */
export function rowyFunctionName(collectionPath: string) {
    return collectionPath
        .replace(/-/g, "_")
        .split("/")
        .filter((_, index) => index % 2 === 0)
        .join("_");
}

function noteFreeText(config: Record<string, any>, ctx: TableContext, field: string) {
    if (config.freeText) {
        addFinding(ctx, field, "review",
            "Rowy let editors type values outside the option list. FireCMS only accepts the listed options, so other stored values show as invalid.");
    }
}

function toEnumValues(options: unknown) {
    const list = Array.isArray(options) ? options.filter(o => typeof o === "string" && o.length > 0) as string[] : [];
    return dedupe(list.map(option => ({ id: option, label: option })));
}

function dedupe<T extends { id: string }>(values: T[]): T[] {
    const seen = new Set<string>();
    return values.filter(value => !seen.has(value.id) && seen.add(value.id));
}

function isPlainValue(value: unknown): boolean {
    if (value === null || ["string", "number", "boolean"].includes(typeof value) || value instanceof Date) return true;
    return Array.isArray(value) && value.every(v => v === null || ["string", "number", "boolean"].includes(typeof v));
}

function hasContent(value: unknown) {
    if (value === undefined || value === null || value === "") return false;
    if (typeof value === "object") return Object.keys(value as object).length > 0;
    return true;
}

function numberOr(value: unknown, fallback: number) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function listOf(values: unknown) {
    return Array.isArray(values) && values.length > 0 ? values.map(v => `\`${v}\``).join(", ") : "";
}

function humanize(key: string) {
    const words = key.replace(/^_+/, "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim();
    return words ? words.charAt(0).toUpperCase() + words.slice(1).toLowerCase() : key;
}

function uniqueName(name: string, used: Set<string>) {
    let candidate = name;
    for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${name}_${n}`;
    used.add(candidate.toLowerCase());
    return candidate;
}
