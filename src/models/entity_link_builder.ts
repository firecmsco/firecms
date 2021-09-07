import { Entity } from "./entities";

export type EntityLinkBuilder<M = any> = ({ entity }: { entity: Entity<M> }) => string;
