import { expectType } from "tsd";
import { initEntityValues } from "../models/firestore";
import { productSchema } from "./test_site_config";


const values = initEntityValues(productSchema, "test");
expectType<string>(values.name);
