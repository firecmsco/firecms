import { Entity, FireCMSContext, User } from "@firecms/core";

/**
 * You can use this configuration to add additional fields to the data
 * exports
 * @group Models
 */
export interface ExportConfig<UserType extends User = User> {
    additionalFields: ExportMappingFunction<UserType> [];
}

/**
 * @group Models
 */
export interface ExportMappingFunction<UserType extends User = User> {
    key: string;
    builder: ({
                  entity,
                  context
              }: {
        entity: Entity<any>,
        context: FireCMSContext<UserType>
    }) => Promise<string> | string;
}
