import * as React from 'react';
import { SchemaEditor } from "./SchemaEditor";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { EntitySchema, ErrorView } from '../../..';
import { useConfigurationPersistence } from "../../../hooks/useConfigurationPersistence";
import Box from '@mui/material/Box';
import { removeFunctions } from "../../util/objects";
import { useSchemaRegistry } from "../../../hooks/useSchemaRegistry";

export type SchemaEditorProps = {
    schemaId: string;
};


export function SchemaEditorPersistence({
                                            schemaId,
                                        }: SchemaEditorProps) {

    const schemaRegistry = useSchemaRegistry();

    const configurationPersistence = useConfigurationPersistence();
    if (!configurationPersistence)
        throw Error("Can't use the schema editor without specifying a `ConfigurationPersistence`");

    const [schema, setSchema] = React.useState<EntitySchema | undefined>();
    const [error, setError] = React.useState<Error>();

    React.useEffect(() => {
        try {
            if (schemaRegistry.initialised)
                setSchema(schemaRegistry.findSchema(schemaId));
        } catch (e) {
            setError(error);
        }
    }, [schemaId, schemaRegistry]);

    if (error) {
        return <ErrorView error={`Error fetching schema ${schemaId}`}/>;
    }

    if (!schemaRegistry.initialised || !schema) {
        return <CircularProgressCenter/>;
    }

    const persistSchema = <M extends { [Key: string]: any }>(schema: EntitySchema<M>) => {
        const properties = removeFunctions(schema.properties);
        const newSchema = {
            ...schema,
            properties: properties,
        };
        delete newSchema.views;
        return configurationPersistence.saveSchema(newSchema);
    };

    return <>
        <Box sx={{ p: 2}}>
            <SchemaEditor schema={schema}
                          onSchemaModified={(schema) => {
                              setSchema(schema);
                              persistSchema(schema);
                          }}/>
        </Box>

    </>;

}