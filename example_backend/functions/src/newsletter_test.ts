import { addUserToMailchimp } from "./mailchimp";
import * as dotenv from "dotenv";

dotenv.config();
addUserToMailchimp("francesco@camberi.com", "demo");
