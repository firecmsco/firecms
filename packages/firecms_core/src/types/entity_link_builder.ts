import { Entity } from "./entities.js";

/**
 * @group Models
 */
export type EntityLinkBuilder<M extends Record<string, any> = any> = ({ entity }: {
    entity: Entity<M>
}) => string;
