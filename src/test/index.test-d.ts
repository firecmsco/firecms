import { expectType } from "tsd";
import { productSchema } from "./test_site_config";
import { EntitySchema, EntityValues } from "../models";

declare function getValues<M>(schema: EntitySchema<M>): EntityValues<M>;

const values = getValues(productSchema);
expectType<string>(values.name);
