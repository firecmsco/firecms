import { expectType } from "tsd";
import { EntityValues } from "./models";
import { initEntityValues } from "./models/firestore";
import { productSchema } from "./test/test_site_config";


const values = initEntityValues(productSchema);
const a:number = values.name;
expectType<EntityValues<any>>(values);
