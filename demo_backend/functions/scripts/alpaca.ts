import * as dotenv from 'dotenv';
import { fetchDemoData } from "../src/alpaca";

dotenv.config();

fetchDemoData().then(console.log);
