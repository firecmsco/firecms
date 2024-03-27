import { addUserToMailchimp } from "../src/mailchimp";
import * as dotenv from "dotenv";

dotenv.config();
addUserToMailchimp("francesco@camberi.com", "demo");
