import axios from "axios";

export function addUserToMailchimp(emailAddress: string, source?: string) {
    const MAILCHIMP_URL = process?.env?.MAILCHIMP_API_URL;
    const MAILCHIMP_TOKEN = process?.env?.MAILCHIMP_TOKEN;
    if (!MAILCHIMP_URL || !MAILCHIMP_TOKEN)
        throw Error("Missing MAILCHIMP_URL");
    const url = MAILCHIMP_URL + '/members';
    const body: Record<string, any> = {
        "email_address": emailAddress,
        "status": "subscribed"
    };
    if (source)
        body.tags = [source];

    const encodedToken = Buffer.from(MAILCHIMP_TOKEN).toString('base64');
    const headers = {
        'Authorization': 'Basic ' + encodedToken
    };
    console.log("Making request", url, body, headers);
    return axios.put(url, body, {
        headers
    }).then(response => {
        return response.data;
    }).catch((e) => {
        console.error(e);
        if(e.code === 'ERR_BAD_REQUEST'){
            throw Error(e.response?.data);
        }
    });
}


