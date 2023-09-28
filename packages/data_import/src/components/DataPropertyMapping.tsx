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
import { PropertyFieldPreview } from "./PropertyFieldPreview";
import { ImportConfig } from "../types";

export interface DataPropertyMappingProps {
    importConfig: ImportConfig;
    onPropertyClicked: (propertyKey: string, property: Property) => void;
    onIdPropertyChanged: (value: string) => void;
}

export function DataPropertyMapping({
                                        importConfig,
                                        onIdPropertyChanged,
                                        onPropertyClicked
                                    }: DataPropertyMappingProps) {

    console.log("DataPropertyMapping", importConfig,)

    return (
        <>

            <IdSelectField importConfig={importConfig}
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
                    {importConfig.properties &&
                        Object.entries(importConfig.headersMapping)
                            .map(([importKey, mappedKey]) => {
                                    const propertyKey = importConfig.headersMapping[importKey];
                                    const property = getPropertyInPath(importConfig.properties, mappedKey) as Property;
                                    return <TableRow key={importKey}>
                                        <TableCell>
                                            <Typography variant={"body2"}>{importKey}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRightIcon/>
                                        </TableCell>
                                        <TableCell>
                                            {importKey === importConfig.idColumn
                                                ? <Typography>This property will be used as ID</Typography>
                                                : <PropertyFieldPreview property={property}
                                                                        propertyKey={propertyKey}
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

function IdSelectField({ importConfig, onChange }: { importConfig: ImportConfig, onChange: (value: string) => void }) {
    return <div>
        <Select
            size={"small"}
            value={importConfig.idColumn}
            onChange={(event) => {
                onChange(event.target.value as string);
            }}
            label={"Column that will be used as ID for each document"}>
            {Object.entries(importConfig.headersMapping).map(([key, value]) => {
                return <SelectItem key={key} value={key}>{key}</SelectItem>;
            })}
        </Select>
        {/*<Typography variant={"caption"} color={"secondary"}*/}
        {/*className={"my-2 ml-3.5"}>The column that will be used as ID for each document</Typography>*/}
    </div>;
}
