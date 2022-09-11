import { Entity } from "./entities";
import { CMSType } from "./properties";

/**
 * @category Models
 */
export type EntityLinkBuilder<M extends Record<string, any> = any> = ({ entity }: { entity: Entity<M> }) => string;
