import { Entity } from "./entities";

/**
 * @category Models
 */
export type EntityLinkBuilder<M = any> = ({ entity }: { entity: Entity<M> }) => string;
