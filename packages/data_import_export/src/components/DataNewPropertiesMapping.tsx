import { getPropertyInPath, Property, } from "@firecms/core";
import {
    ChevronRightIcon,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    Typography
} from "@firecms/ui";

export interface DataPropertyMappingProps {
    idColumn?: string;
    headersMapping: Record<string, string | null>;
    originProperties: Record<string, Property>;
    destinationProperties: Record<string, Property>;
    onIdPropertyChanged: (value: string) => void;
    buildPropertyView?: (props: {
        isIdColumn: boolean,
        property: Property | null,
        propertyKey: string | null,
        importKey: string
    }) => React.ReactNode;
}

export function DataNewPropertiesMapping({
                                             idColumn,
                                             headersMapping,
                                             originProperties,
                                             destinationProperties,
                                             onIdPropertyChanged,
                                             buildPropertyView,
                                         }: DataPropertyMappingProps) {

    return (
        <>

            <IdSelectField idColumn={idColumn}
                           headersMapping={headersMapping}
                           onChange={onIdPropertyChanged}/>

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
                        Property
                    </TableCell>
                </TableHeader>
                <TableBody>
                    {destinationProperties &&
                        Object.entries(headersMapping)
                            .map(([importKey, mappedKey]) => {
                                    const propertyKey = headersMapping[importKey];
                                    const property = mappedKey ? getPropertyInPath(destinationProperties, mappedKey) as Property : null;

                                    const originProperty = getPropertyInPath(originProperties, importKey) as Property | undefined;
                                    const originDataType = originProperty ? (originProperty.dataType === "array" && typeof originProperty.of === "object"
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
                                            })
                                            }
                                        </TableCell>
                                    </TableRow>;
                                }
                            )}
                </TableBody>
            </Table>
        </>
    );
}

function IdSelectField({
                           idColumn,
                           headersMapping,
                           onChange
                       }: {
    idColumn?: string,
    headersMapping: Record<string, string | null>;
    onChange: (value: string) => void
}) {
    return <div>
        <Select
            size={"small"}
            value={idColumn ?? ""}
            onChange={(event) => {
                onChange(event.target.value as string);
            }}
            renderValue={(value) => {
                return <Typography variant={"body2"}>
                    {value !== "" ? value : "Autogenerate ID"}
                </Typography>;
            }}
            label={"Column that will be used as ID for each document"}>
            <SelectItem value={""}>Autogenerate ID</SelectItem>
            {Object.entries(headersMapping).map(([key, value]) => {
                return <SelectItem key={key} value={key}>{key}</SelectItem>;
            })}
        </Select>
    </div>;
}
