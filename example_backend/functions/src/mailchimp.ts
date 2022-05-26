import axios from "axios";
// require('dotenv').config()

export function addUserToMailchimp(emailAddress:string) {
    const MAILCHIMP_URL = process?.env?.MAILCHIMP_API_URL;
    const MAILCHIMP_TOKEN = process?.env?.MAILCHIMP_TOKEN;
    if(!MAILCHIMP_URL || !MAILCHIMP_TOKEN)
        throw Error("Missing MAILCHIMP_URL");
    const url = MAILCHIMP_URL + '/members';
    const body = {
        "email_address": emailAddress,
        "status": "subscribed"
    };

    const encodedToken = Buffer.from(MAILCHIMP_TOKEN).toString('base64');
    const headers = {
        'Authorization': 'Basic ' + encodedToken
    };
    console.log("Making request", url, body, headers);
    return axios.post(url, body, {
        headers
    }).then(response => {
        return response.data;
    }).catch((e) => {
        if(e.code === 'ERR_BAD_REQUEST'){
            throw Error(e.response?.data);
        }
    });
}


