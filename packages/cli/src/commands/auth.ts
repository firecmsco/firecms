import open from "open";

import fs from "fs";
import http from "http";
import path from "path";
import axios from "axios";
import { DEFAULT_SERVER, DEFAULT_SERVER_DEV } from "../common";
import * as os from "os";
import EventEmitter from "events";
import chalk from "chalk";
import { done_html } from "../util/done_html";

import https from "https";

import url from "url";

export async function getCurrentUser(env: "prod" | "dev", debug: boolean): Promise<object | null> {
    if (debug) console.log("Getting current user");
    const userCredential = await getTokens(env, debug);
    if (!userCredential) {
        return null;
    }
    if (debug) console.log("userCredential", userCredential);
    return parseJwt(userCredential["id_token"]);
}

export async function login(env: "prod" | "dev", debug: boolean) {
    const emitter = new EventEmitter();
    const currentUser = await getCurrentUser(env, debug);
    if (currentUser) {
        console.log("You are already logged in as", currentUser["email"]);
        console.log(`Run ${chalk.bold("firecms logout")} to sign out`);
        return;
    }

    const activeConnections: Set<any> = new Set();
    const server = http.createServer(async (req, res) => {
        res.setHeader("Cache-Control", "no-store, max-age=0");

        if (req.url === "/") {
            const authURL = await getAuthURL(env);
            console.log("Opening browser to", authURL);
            res.writeHead(301, { "Location": authURL });
            res.end();
        }

        if (req.url.startsWith("/oauth2callback")) {
            const q = url.parse(req.url, true).query;

            if (q.error) {
                console.log("Error:" + q.error);
                server.close();
                throw q.error;
            } else {
                // return the imported html
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(done_html, () => req.socket.end());
                emitter.emit("tokensReady", q.code);

            }
        }

    }).listen(3000);

    server.on("connection", (socket) => {
        activeConnections.add(socket);
        socket.on("close", () => {
            activeConnections.delete(socket);
        });
    });

    open("http://localhost:3000");

    return new Promise(async (resolve, reject) => {
        emitter.once("tokensReady", async (code) => {
            // Handle the OAuth 2.0 server response
            const tokens = await exchangeCodeForToken(code, env);
            if (!tokens) {
                return reject("Token could not be obtained");
            } else {
                console.log("You have successfully logged in.");
                saveTokens(tokens, env);
                resolve(tokens);
            }
            for (const socket of activeConnections) {
                socket.destroy();
            }
            server.close();
        })
    });
}

// save this token to a file in .firecms or program data
function saveTokens(tokens: object, env: "prod" | "dev") {
    const dirPath = path.join(os.homedir(), ".firecms");

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    const filePath = path.join(dirPath, (env === "dev" ? "staging." : "") + "tokens.json");

    const data = JSON.stringify(tokens);

    fs.writeFileSync(filePath, data);

}

export async function logout(env: "prod" | "dev", debug: boolean) {

    const userCredential = await getTokens(env, debug);
    if (!userCredential) {
        console.log("⚠️ You are not logged in");
        console.log(`Run ${chalk.red.bold("firecms login")} to log in`);
        return;
    }

    revokeToken(userCredential["access_token"], env);

    const dirPath = path.join(os.homedir(), ".firecms");
    const filePath = path.join(dirPath, (env === "dev" ? "staging." : "") + "tokens.json");
    fs.unlinkSync(filePath);
    console.log("You have successfully logged out.")
}

export async function getTokens(env: "prod" | "dev", debug: boolean): Promise<object | null> {
    const dirPath = path.join(os.homedir(), ".firecms");
    const filePath = path.join(dirPath, (env === "dev" ? "staging." : "") + "tokens.json");

    if (!fs.existsSync(filePath)) {
        return null;
    }

    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (debug) console.log("getTokens", { data });
            if (err) {
                reject(err);
                return;
            }
            const result = JSON.parse(data);
            if (result["env"] === "dev") {
                console.log("Using DEV environment");
            }
            resolve(result);
        });
    });
}

function revokeToken(accessToken: string, env: "prod" | "dev") {
    // Build the string for the POST request
    const postData = "token=" + accessToken;

    // Options for POST request to Google's OAuth 2.0 server to revoke a token
    const postOptions = {
        host: "oauth2.googleapis.com",
        port: "443",
        path: "/revoke",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(postData)
        }
    };

    // Set up the request
    const postReq = https.request(postOptions, function (res) {
        res.setEncoding("utf8");
        res.on("data", d => {
            // console.log("Response: " + d);
        });
    });

    postReq.on("error", error => {
        console.log(error)
    });

    // Post the request with data
    postReq.write(postData);
    postReq.end();
}

export function parseJwt(token: string): object {
    if (!token) {
        throw new Error("No JWT token");
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(base64, "base64");
    // console.log({
    //     base64Url,
    //     base64,
    //     buffer: buffer.toString()
    // });
    // const uri = buffer.toString().split("").map(function (c) {
    //     return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    // }).join("");
    // console.log({ uri });
    // const jsonPayload = decodeURIComponent(uri);

    return JSON.parse(buffer.toString());
}

async function getAuthURL(env: "prod" | "dev") {
    const server = env === "prod" ? DEFAULT_SERVER : DEFAULT_SERVER_DEV;

    const response = await axios.get(server + "/cli/generate_auth_url", {
        params: {
            redirect_uri: "http://localhost:3000/oauth2callback/"
        }
    });

    return response.data.data;
}

export async function refreshCredentials(env: "dev" | "prod", credentials?: object, onErr?: (e: any) => void) {
    if (credentials) {
        const expiryDate = new Date(credentials["expiry_date"]);
        const now = new Date();
        if (expiryDate.getTime() > now.getTime()) {
            return credentials;
        }
    }
    try {
        const server = env === "prod" ? DEFAULT_SERVER : DEFAULT_SERVER_DEV;

        const response = await axios.post(server + "/cli/refresh_access_token", credentials);
        const newCredentials = response.data.data;
        saveTokens({
            ...credentials,
            ...newCredentials,
            env
        }, env);
        return newCredentials;
    } catch (error) {
        if (onErr) onErr(error);
        await logout(env, false);
        console.error("\nError refreshing credentials", error.response?.status, error.response?.data?.message);
        console.log(`⚠️ Run ${chalk.red.bold("firecms login")} to log in again`);
        return null;
    }
}

async function exchangeCodeForToken(code: string, env: "prod" | "dev") {
    const server = env === "prod" ? DEFAULT_SERVER : DEFAULT_SERVER_DEV;

    const response = await axios.get(server + "/cli/exchange_code_for_token", {
        params: {
            code
        }
    });

    return response.data.data;
}


