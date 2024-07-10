import { getPropertyInPath, PropertiesOrBuilders, Property } from "@firecms/core";
import {
    BooleanSwitchWithLabel,
    ChevronRightIcon,
    DateTimeField,
    ExpandablePanel,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    TextField,
    Typography
} from "@firecms/ui";
import { ImportConfig } from "../types";
import { getIn, setIn } from "@firecms/formex";

export interface DataPropertyMappingProps {
    importConfig: ImportConfig;
    destinationProperties: Record<string, Property>;
    buildPropertyView?: (props: {
        isIdColumn: boolean,
        property: Property | null,
        propertyKey: string | null,
        importKey: string
    }) => React.ReactNode;
}

export function DataNewPropertiesMapping({
                                             importConfig,
                                             destinationProperties,
                                             buildPropertyView
                                         }: DataPropertyMappingProps) {

    const headersMapping = importConfig.headersMapping;
    const headingsOrder = importConfig.headingsOrder;
    const idColumn = importConfig.idColumn;
    const originProperties = importConfig.originProperties;

    return (
        <>

            <IdSelectField idColumn={idColumn}
                           headersMapping={headersMapping}
                           onChange={(value) => importConfig.setIdColumn(value ?? undefined)}/>

            <div className={"h-4"}/>

            <Table style={{
                tableLayout: "fixed"
            }}>
                <TableHeader>
                    <TableCell header={true} style={{ width: "20%" }}>
                        Column in file
                    </TableCell>
                    <TableCell header={true}>
                    </TableCell>
                    <TableCell header={true} style={{ width: "75%" }}>
                        Map to Property
                    </TableCell>
                </TableHeader>
                <TableBody>
                    {destinationProperties &&
                        headingsOrder.map((importKey) => {
                                const mappedKey = headersMapping[importKey];
                                const propertyKey = headersMapping[importKey];
                                const property = mappedKey ? getPropertyInPath(destinationProperties, mappedKey) as Property : null;

                                const originProperty = getPropertyInPath(originProperties, importKey) as Property | undefined;
                                const originDataType = originProperty
                                    ? (originProperty.dataType === "array" && typeof originProperty.of === "object"
                                        ? `${originProperty.dataType} - ${(originProperty.of as Property).dataType}`
                                        : originProperty.dataType)
                                    : undefined;
                                return <TableRow key={importKey} style={{ height: "90px" }}>
                                    <TableCell style={{ width: "20%" }}>
                                        <Typography variant={"body2"}>{importKey}</Typography>
                                        {originProperty && <Typography
                                            variant={"caption"}
                                            color={"secondary"}
                                        >{originDataType}</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <ChevronRightIcon/>
                                    </TableCell>
                                    <TableCell className={importKey === idColumn ? "text-center" : undefined}
                                               style={{ width: "75%" }}>
                                        {buildPropertyView?.({
                                            isIdColumn: importKey === idColumn,
                                            property,
                                            propertyKey,
                                            importKey
                                        })}
                                    </TableCell>
                                </TableRow>;
                            }
                        )}
                </TableBody>
            </Table>

            <ExpandablePanel title="Default values" initiallyExpanded={false} className={"p-4 mt-4"}>

                <div className={"text-sm text-slate-500 dark:text-slate-300 font-medium ml-3.5 mb-1"}>
                    You can select a default value for unmapped columns and empty values:
                </div>
                <Table style={{
                    tableLayout: "fixed"
                }}>
                    <TableHeader>
                        <TableCell header={true} style={{ width: "30%" }}>
                            Property
                        </TableCell>
                        <TableCell header={true}>
                        </TableCell>
                        <TableCell header={true} style={{ width: "65%" }}>
                            Default value
                        </TableCell>
                    </TableHeader>
                    <TableBody>
                        {destinationProperties &&
                            getAllPropertyKeys(destinationProperties).map((key) => {
                                    const property = getPropertyInPath(destinationProperties, key);
                                    if (typeof property !== "object" || property === null) {
                                        return null;
                                    }
                                    if (!["number", "string", "boolean", "map"].includes(property.dataType)) {
                                        return null;
                                    }
                                    return <TableRow key={key} style={{ height: "70px" }}>
                                        <TableCell style={{ width: "20%" }}>
                                            <Typography variant={"body2"}>{key}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRightIcon/>
                                        </TableCell>
                                        <TableCell className={key === idColumn ? "text-center" : undefined}
                                                   style={{ width: "75%" }}>
                                            <DefaultValuesField property={property}
                                                                defaultValue={getIn(importConfig.defaultValues, key)}
                                                                onValueChange={(value) => {
                                                                    const newValues = setIn(importConfig.defaultValues, key, value);
                                                                    importConfig.setDefaultValues(newValues);
                                                                }}/>
                                        </TableCell>
                                    </TableRow>;
                                }
                            )}
                    </TableBody>
                </Table>
            </ExpandablePanel>
        </>
    );
}

function getAllPropertyKeys(properties: PropertiesOrBuilders, currentKey?: string): string[] {
    return Object.entries(properties).reduce((acc, [key, property]) => {
        const accumulatedKey = currentKey ? `${currentKey}.${key}` : key;
        if (typeof property !== "function" && property.dataType === "map" && property.properties) {
            const childProperties = getAllPropertyKeys(property.properties, accumulatedKey);
            return [...acc, ...childProperties];
        }
        return [...acc, accumulatedKey];
    }, [] as string[]);
}

function IdSelectField({
                           idColumn,
                           headersMapping,
                           onChange
                       }: {
    idColumn?: string,
    headersMapping: Record<string, string | null>;
    onChange: (value: string | null) => void
}) {
    return <div>
        <Select
            size={"small"}
            value={idColumn ?? ""}
            onChange={(event) => {
                const value = event.target.value;
                onChange(value === "__none__" ? null : value);
            }}
            placeholder={"Autogenerate ID"}
            renderValue={(value) => {
                return <Typography variant={"body2"}>
                    {value !== "__none__" ? value : "Autogenerate ID"}
                </Typography>;
            }}
            label={"Column that will be used as ID for each document"}>
            <SelectItem value={"__none__"}>Autogenerate ID</SelectItem>
            {Object.entries(headersMapping).map(([key, value]) => {
                return <SelectItem key={key} value={key}>{key}</SelectItem>;
            })}
        </Select>
    </div>;
}

function DefaultValuesField({
                                property,
                                onValueChange,
                                defaultValue
                            }: { property: Property, onValueChange: (value: any) => void, defaultValue?: any }) {
    if (property.dataType === "string") {
        return <TextField size={"small"}
                          placeholder={"Default value"}
                          value={defaultValue ?? ""}
                          onChange={(event) => onValueChange(event.target.value)}/>;
    } else if (property.dataType === "number") {
        return <TextField size={"small"}
                          type={"number"}
                          value={defaultValue ?? ""}
                          placeholder={"Default value"}
                          onChange={(event) => onValueChange(event.target.value)}/>;
    } else if (property.dataType === "boolean") {
        return <BooleanSwitchWithLabel
            value={defaultValue ?? null}
            allowIndeterminate={true}
            size={"small"}
            onValueChange={(v: boolean | null) => onValueChange(v === null ? undefined : v)}
            label={defaultValue === undefined
                ? "Do not set value"
                : defaultValue === true
                    ? "Set value to true"
                    : "Set value to false"}
        />
    } else if (property.dataType === "date") {
        return <DateTimeField
            mode={property.mode ?? "date"}
            size={"small"}
            value={defaultValue ?? undefined}
            onChange={(dateValue: Date | undefined) => {
                onValueChange(dateValue);
            }}
            clearable={true}
        />
    }

    return null;
}
