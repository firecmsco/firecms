import * as dotenv from "dotenv";
dotenv.config();

import { fetchFromMeiliSearch } from "../src/indexing/meilisearch";

fetchFromMeiliSearch("products", "selectable = true");
