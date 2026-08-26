import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import {
    Icon, IconButton, PropertyConfigBadge, SelectDisplay, Table, TableBody, TableCell,
    TableHeader, TableRow, TextFieldDisplay, Typography, cls, useMaterialIcons,
    type PropertyConfigKey
} from "./firecms/ui";

/**
 * CSV import column mapping — the FireCMS PRO import view.
 *
 * Transcribed from packages/data_import/src/components/DataNewPropertiesMapping.tsx
 * and ImportNewPropertyFieldPreview.tsx: an id-column Select above a fixed-layout
 * table of "Column in file" (20%) / chevron / "Map to property" (75%), rows 90px
 * tall, each mapped row showing the property type badge, the property name in a
 * TextField and an edit IconButton.
 *
 * Autoplay only — no pointer events.
 */

type Row = {
    /** Header as it appears in the CSV. */
    importKey: string;
    /** Inferred source type, as `dataType` or `array - dataType`. */
    originDataType: string;
    /** Property it maps to in the collection. */
    name: string;
    config: PropertyConfigKey;
};

const ROWS: Row[] = [
    { importKey: "sku",          originDataType: "string",         name: "Sku",         config: "text_field" },
    { importKey: "product_name", originDataType: "string",         name: "Name",        config: "text_field" },
    { importKey: "price_eur",    originDataType: "number",         name: "Price",       config: "number_input" },
    { importKey: "in_stock",     originDataType: "boolean",        name: "Available",   config: "switch" },
    { importKey: "category_ref", originDataType: "string",         name: "Category",    config: "reference" },
    { importKey: "tags",         originDataType: "array - string", name: "Tags",        config: "repeat" },
    { importKey: "added_on",     originDataType: "date",           name: "Created on",  config: "date_time" }
];

export default function ImportMappingDemo({ height = 800 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [mapped, setMapped] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useMaterialIcons();

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        const done = mapped >= ROWS.length;
        timer.current = setTimeout(() => setMapped(m => (m >= ROWS.length ? 0 : m + 1)), done ? 2600 : 620);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [mapped, inView]);

    return (
        <div ref={ref}
             className="w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-white dark:bg-surface-950"
             style={{ height }}
             aria-label="The FireCMS import view mapping CSV columns onto collection properties, with the property type inferred for each">
            <div className="h-full overflow-hidden p-6">

                {/* IdSelectField */}
                <SelectDisplay size={"medium"} fullWidth>
                    <Typography variant={"body2"}>sku</Typography>
                </SelectDisplay>

                <div className={"h-4"}/>

                <Table style={{ tableLayout: "fixed", width: "100%" }}>
                    <TableHeader>
                        <TableCell header style={{ width: "20%" }}>Column in file</TableCell>
                        <TableCell header style={{ width: "5%" }}/>
                        <TableCell header style={{ width: "75%" }}>Map to property</TableCell>
                    </TableHeader>
                    <TableBody>
                        {ROWS.map((row, i) => {
                            const on = i < mapped;
                            return (
                                <TableRow key={row.importKey} style={{ height: "90px" }}>
                                    <TableCell style={{ width: "20%" }}>
                                        <Typography variant={"body2"}>{row.importKey}</Typography>
                                        <br/>
                                        <Typography variant={"caption"} color={"secondary"}>
                                            {row.originDataType}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ width: "5%" }}>
                                        <Icon icon={"chevron_right"} className="text-surface-accent-500"/>
                                    </TableCell>
                                    <TableCell style={{ width: "75%" }}>
                                        <div className={cls(
                                            "flex flex-row w-full items-center transition-opacity duration-300",
                                            on ? "opacity-100" : "opacity-0")}>
                                            <div className={"mx-4"}>
                                                <PropertyConfigBadge config={row.config}/>
                                            </div>
                                            <div className="w-full flex flex-col grow">
                                                <div className={"flex flex-row items-center gap-2"}>
                                                    <TextFieldDisplay size={"medium"} value={row.name} className={"text-base grow"}/>
                                                    <IconButton size={"small"}>
                                                        <Icon icon={"edit"} size={"small"}/>
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
