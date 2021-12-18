import * as React from 'react';
import { useNavigation } from "../../../hooks";
import {
    ConfigurationPersistence,
    StoredEntitySchema
} from "../../../models/config_persistence";
import { SchemaEditor } from "./SchemaEditor";
import { CircularProgressCenter } from "../CircularProgressCenter";

export type SchemaEditorProps = {
    schemaId: string;
    configurationPersistence: ConfigurationPersistence;
};


export function SchemaEditorPersistence({
                                            schemaId,
                                            configurationPersistence,
                                        }: SchemaEditorProps) {

    const [schema, setSchema] = React.useState<StoredEntitySchema | undefined>();
    React.useEffect(() => {
        configurationPersistence.getSchema(schemaId).then((res) => setSchema(res));
    }, [schemaId]);

    if (!schema) {
        return <CircularProgressCenter/>;
    }
    return <SchemaEditor schema={schema}
                         onSchemaModified={configurationPersistence.saveSchema}/>;

}