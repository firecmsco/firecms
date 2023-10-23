import open from 'open';
import WebSocket from "ws";

import fs from "fs";
import http from "http";
import path from 'path';
import axios from "axios";
import * as querystring from "querystring";


export async function authInBrowser() {
    const wss = new WebSocket.Server({ port: 9117 });

    const childProcess = await open('https://app.firecms.co/cli');
    // await open('http://localhost:5173/cli');

    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            const data = JSON.parse(message.toString());
            const jwt = parseJwt(data.token);
            console.log('jwt', jwt);
        });
    });

}

export function parseJwt(token: string): object {
    if (!token) {
        throw new Error("No JWT token");
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(base64, 'base64');
    const jsonPayload = decodeURIComponent(buffer.toString().split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}



/**
 * Get Google Oauth access token by starting a server
 * @return {Promise<string>}
 */
export function getGoogleOauthToken(): Promise<string> {
    return new Promise((async (resolve, reject) => {

        const connection = http.createServer(function (req, res) {
            if (req.url.includes("result")) {
                const accessToken = req.url.replace("/result/", "");
                res.end();
                connection.close();
                req.connection.end();
                req.connection.destroy();
                resolve(accessToken);
            } else if (req.url.includes("error")) {
                res.end();
                reject();
                req.connection.end();
                req.connection.destroy();
                connection.close();
            } else {
                fs.readFile(path.join(__dirname, "/../auth/index.html"),
                    function (err, data) {
                        if (err) {
                            res.writeHead(404);
                            res.end(JSON.stringify(err));
                            return;
                        }
                        res.writeHead(200);
                        res.end(data);
                    });
            }
        }).listen(3000);

        open('http://localhost:3000');

    }));
}

export async function getGoogleRefreshToken(code: string): Promise<string> {

    const requestBody = {
        client_id: "175047346381-vbhs16ok2uv8ihvlp05k5meruo57o0af.apps.googleusercontent.com",
        client_secret: "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",
        grant_type: 'authorization_code',
        code,
        redirect_uri: "http://localhost:3000",
    };

    console.log("requestBody", requestBody)

    try {
        const { data } = await axios.post(
            'https://oauth2.googleapis.com/token', // Google's API to exchange code for tokens
            querystring.stringify(requestBody), // Convert JS object to url-encoded string
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        console.log(data); // log the response
        return data;

        // data object includes access_token, refresh_token, scope, token_type, and expiry_date
    } catch (error) {
        console.error(error.response.data); // log the error
    }

}


