import {
    ChevronRightIcon,
    getPropertyInPath,
    Property,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    Typography
} from "firecms";
import { ImportPropertyFieldPreview } from "./ImportPropertyFieldPreview";

export interface DataPropertyMappingProps {
    idColumn?: string;
    headersMapping: Record<string, string>;
    properties: Record<string, Property>;
    onPropertyEditClicked: (propertyKey: string, property: Property) => void;
    onIdPropertyChanged: (value: string) => void;
    onPropertyNameChanged?: (propertyKey: string, value: string) => void;
    propertyBadgeBuilder?: (props: { importKey: string, propertyKey: string, property: Property }) => React.ReactNode;
}

export function DataPropertyMapping({
                                        idColumn,
                                        headersMapping,
                                        properties,
                                        onIdPropertyChanged,
                                        onPropertyEditClicked,
                                        onPropertyNameChanged,
                                        propertyBadgeBuilder
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
                    {properties &&
                        Object.entries(headersMapping)
                            .map(([importKey, mappedKey]) => {
                                    const propertyKey = headersMapping[importKey];
                                    const property = getPropertyInPath(properties, mappedKey) as Property;

                                    const propertySelect = propertyBadgeBuilder?.({ importKey, propertyKey, property });

                                    return <TableRow key={importKey} style={{ height: "90px" }}>
                                        <TableCell style={{ width: "20%" }}>
                                            <Typography variant={"body2"}>{importKey}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRightIcon/>
                                        </TableCell>
                                        <TableCell className={importKey === idColumn ? "text-center" : undefined}
                                                   style={{ width: "75%" }}>
                                            {importKey === idColumn
                                                ? <Typography variant={"label"}>
                                                    This column will be used as the ID
                                                </Typography>
                                                : <ImportPropertyFieldPreview
                                                    importKey={importKey}
                                                    property={property}
                                                    propertyKey={propertyKey}
                                                    onPropertyNameChanged={onPropertyNameChanged}
                                                    onEditClick={
                                                        () => {
                                                            if (onPropertyEditClicked)
                                                                onPropertyEditClicked(propertyKey, property);
                                                        }
                                                    }
                                                    propertyTypeView={propertySelect}
                                                />
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

function IdSelectField({ idColumn, headersMapping, onChange }: {
    idColumn?: string,
    headersMapping: Record<string, string>;
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
                console.log("value", value);
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
