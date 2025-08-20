import { Entity } from "./entities";

/**
 * @group Models
 */
export type EntityLinkBuilder<M extends Record<string, any> = any> = ({ entity }: {
    entity: Entity<M>
}) => string;
