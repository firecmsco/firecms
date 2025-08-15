import React, { useCallback } from "react";

import { Entity, ResolvedProperties } from "@firecms/core";
import {
    BooleanSwitchWithLabel,
    Button,
    cls,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DownloadIcon,
    IconButton,
    Tooltip
} from "@firecms/ui";
import { downloadEntitiesExport } from "./export";

export type BasicExportActionProps = {
    data: Entity<any>[];
    properties: ResolvedProperties;
    propertiesOrder?: string[];
}

export function BasicExportAction({
                                      data,
                                      properties,
                                      propertiesOrder
                                  }: BasicExportActionProps) {

    const dateRef = React.useRef<Date>(new Date());
    const [flattenArrays, setFlattenArrays] = React.useState<boolean>(true);
    const [exportType, setExportType] = React.useState<"csv" | "json">("csv");
    const [dateExportType, setDateExportType] = React.useState<"timestamp" | "string">("string");

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const onOkClicked = useCallback(() => {
        downloadEntitiesExport({
            data,
            additionalData: [],
            properties,
            propertiesOrder,
            name: "export.csv",
            flattenArrays,
            additionalHeaders: [],
            exportType,
            dateExportType
        });
        handleClose();
    }, []);

    return <>

        <Tooltip title={"Export"}
                 asChild={true}>
            <IconButton
                size={"small"}
                color={"primary"} onClick={handleClickOpen}>
                <DownloadIcon
                    size={"small"}/>
            </IconButton>
        </Tooltip>

        <Dialog
            open={open}
            onOpenChange={setOpen}
            maxWidth={"xl"}>

            <DialogTitle variant={"h6"}>Export data</DialogTitle>

            <DialogContent className={"flex flex-col gap-4 my-4"}>

                <div>Download the the content of this table as a CSV</div>

                <div className={"flex flex-row gap-4"}>
                    <div className={"p-4 flex flex-col"}>
                        <div className="flex items-center">
                            <input id="radio-csv" type="radio" value="csv" name="exportType"
                                   checked={exportType === "csv"}
                                   onChange={() => setExportType("csv")}
                                   className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")}/>
                            <label htmlFor="radio-csv"
                                   className="p-2 text-sm font-medium text-surface-900 dark:text-surface-accent-300">CSV</label>
                        </div>
                        <div className="flex items-center">
                            <input id="radio-json" type="radio" value="json" name="exportType"
                                   checked={exportType === "json"}
                                   onChange={() => setExportType("json")}
                                   className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")}/>
                            <label htmlFor="radio-json"
                                   className="p-2 text-sm font-medium text-surface-900 dark:text-surface-accent-300">JSON</label>
                        </div>
                    </div>

                    <div className={"p-4 flex flex-col"}>
                        <div className="flex items-center">
                            <input id="radio-timestamp" type="radio" value="timestamp" name="dateExportType"
                                   checked={dateExportType === "timestamp"}
                                   onChange={() => setDateExportType("timestamp")}
                                   className={cls( "w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")}/>
                            <label htmlFor="radio-timestamp"
                                   className="p-2 text-sm font-medium text-surface-900 dark:text-surface-accent-300">Dates as
                                timestamps ({dateRef.current.getTime()})</label>
                        </div>
                        <div className="flex items-center">
                            <input id="radio-string" type="radio" value="string" name="dateExportType"
                                   checked={dateExportType === "string"}
                                   onChange={() => setDateExportType("string")}
                                   className={cls( "w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")}/>
                            <label htmlFor="radio-string"
                                   className="p-2 text-sm font-medium text-surface-900 dark:text-surface-accent-300">Dates as
                                strings ({dateRef.current.toISOString()})</label>
                        </div>
                    </div>
                </div>

                <BooleanSwitchWithLabel
                    size={"small"}
                    disabled={exportType !== "csv"}
                    value={flattenArrays}
                    onValueChange={setFlattenArrays}
                    label={"Flatten arrays"}/>

            </DialogContent>

            <DialogActions>

                <Button onClick={handleClose}
                        color={"primary"}
                        variant={"text"}>
                    Cancel
                </Button>

                <Button variant="filled"
                        color={"primary"}
                        onClick={onOkClicked}>
                    Download
                </Button>

            </DialogActions>

        </Dialog>

    </>;
}
