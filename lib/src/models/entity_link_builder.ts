import { Entity } from "./entities";
import { CMSType } from "./properties";

/**
 * @category Models
 */
export type EntityLinkBuilder<M extends object = object> = ({ entity }: { entity: Entity<M> }) => string;
