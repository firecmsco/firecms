import { AnyProperty } from "./properties";
import { EntitySchema } from "./entities";
import { EntityCollection } from "./collections";

export type PartialProperties<M> = Record<any, Partial<AnyProperty>>;

export type PartialSchema<M> = Omit<Partial<EntitySchema<M>>, "properties"> &
    {
        properties: PartialProperties<M>
    };

export type PartialEntityCollection<M> =
    Omit<Partial<EntityCollection<M>>, "schema"> & {
    schema: PartialSchema<M>
};