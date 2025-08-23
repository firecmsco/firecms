import { Entity } from "./entities";
import { User } from "../users";
import { FireCMSContext } from "../firecms_context";

/**
 * You can use this configuration to add additional fields to the data
 * exports
 * @group Models
 */
export interface ExportConfig<USER extends User = User> {
    additionalFields: ExportMappingFunction<USER> [];
}

/**
 * @group Models
 */
export interface ExportMappingFunction<USER extends User = User> {
    key: string;
    builder: ({
                  entity,
                  context
              }: {
        entity: Entity<any>,
        context: FireCMSContext<USER>
    }) => Promise<string> | string;
}
