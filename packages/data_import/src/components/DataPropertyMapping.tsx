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
    onPropertyClicked: (propertyKey: string, property: Property) => void;
    onIdPropertyChanged: (value: string) => void;
    onPropertyNameChanged?: (propertyKey: string, value: string) => void;
}



export function DataPropertyMapping({
                                        idColumn,
                                        headersMapping,
                                        properties,
                                        onIdPropertyChanged,
                                        onPropertyClicked,
                                        onPropertyNameChanged
                                    }: DataPropertyMappingProps) {

    return (
        <>

            <IdSelectField idColumn={idColumn}
                           headersMapping={headersMapping}
                           onChange={onIdPropertyChanged}/>

            <Table>
                <TableHeader>
                    <TableCell header={true}>
                        Column in file
                    </TableCell>
                    <TableCell header={true}>
                    </TableCell>
                    <TableCell header={true}>
                        Property
                    </TableCell>
                </TableHeader>
                <TableBody>
                    {properties &&
                        Object.entries(headersMapping)
                            .map(([importKey, mappedKey]) => {
                                    const propertyKey = headersMapping[importKey];
                                    const property = getPropertyInPath(properties, mappedKey) as Property;
                                    return <TableRow key={importKey}>
                                        <TableCell>
                                            <Typography variant={"body2"}>{importKey}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRightIcon/>
                                        </TableCell>
                                        <TableCell>
                                            {importKey === idColumn
                                                ? <Typography>This property will be used as ID</Typography>
                                                : <ImportPropertyFieldPreview property={property}
                                                                              propertyKey={propertyKey}
                                                                              onPropertyNameChanged={onPropertyNameChanged}
                                                                              onClick={
                                                                                  () => {
                                                                                      if (onPropertyClicked)
                                                                                          onPropertyClicked(propertyKey, property);
                                                                                  }
                                                                              }/>}
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
            value={idColumn}
            onChange={(event) => {
                onChange(event.target.value as string);
            }}
            label={"Column that will be used as ID for each document"}>
            {Object.entries(headersMapping).map(([key, value]) => {
                return <SelectItem key={key} value={key}>{key}</SelectItem>;
            })}
        </Select>
        {/*<Typography variant={"caption"} color={"secondary"}*/}
        {/*className={"my-2 ml-3.5"}>The column that will be used as ID for each document</Typography>*/}
    </div>;
}
