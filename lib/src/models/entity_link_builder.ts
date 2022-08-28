import { Entity } from "./entities";
import { CMSType } from "./properties";

/**
 * @category Models
 */
export type EntityLinkBuilder<M extends { [Key: string]: CMSType } = any> = ({ entity }: { entity: Entity<M> }) => string;
