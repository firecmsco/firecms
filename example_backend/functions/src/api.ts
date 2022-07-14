import * as cors from "cors";
import * as functions from "firebase-functions";
import * as express from "express";
import { addUserToMailchimp } from "./mailchimp";

export const app = express();
app.use(express.json());

const whitelist = ['https://firecms.co', 'https://demo.firecms.co', 'https://demo.next.firecms.co', 'http://localhost:3000']
app.use(cors({
    origin: function (origin: string | undefined, callback: any) {
        if (origin && whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            console.error("Origin not supported", origin)
            callback(new Error('Not allowed by CORS ' + origin))
        }
    }
}));

app.post('/sign_up_newsletter', (req, res) => {
    const emailAddress = req.body.email_address;
    const source = req.body.source;
    if(!emailAddress)
        throw Error("empty email_address");
    const result = addUserToMailchimp(emailAddress, source);
    return result
        .then(function (data) {
            console.log("response from mailchimp", data);
            res.send(data);
            return res.sendStatus(200);
        })
        .catch(function (error) {
            console.error(error);
            return res.sendStatus(500);
        });

});

// Expose Express API as a single Cloud Function:
export const api = functions.https.onRequest(app);
