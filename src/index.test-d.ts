import {expectType} from 'tsd';
import { initEntityValues } from "./models/firestore";
import { productSchema } from "./test/test_site_config";


const values = initEntityValues(productSchema);
expectType<string>(values.name);
