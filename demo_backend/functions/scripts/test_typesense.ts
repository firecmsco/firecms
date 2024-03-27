import * as dotenv from "dotenv";
dotenv.config();

import { searchInTypesense } from "../src/indexing/typesense";

searchInTypesense("products", "chair");
