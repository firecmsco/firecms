// import { cli } from "./cli";
// import { main } from "./commands/auth";
import { entry } from "./cli";

// const path = require('path');
// const fs = require('fs');
// const directoryPath = path.join(__dirname, '../templates/template');
// console.log(directoryPath)
// fs.readdir(directoryPath, function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }
//     //listing all files using forEach
//     files.forEach(function (file) {
//         // Do whatever you want to do with the file
//         console.log(file);
//     });
// });

async function main() {
    // await logout("prod", true);
    // await login("prod", true);
    // const object = parseJwt("eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg1ZTU1MTA3NDY2YjdlMjk4MzYxOTljNThjNzU4MWY1YjkyM2JlNDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxNzUwNDczNDYzODEtdmJoczE2b2sydXY4aWh2bHAwNWs1bWVydW81N28wYWYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxNzUwNDczNDYzODEtdmJoczE2b2sydXY4aWh2bHAwNWs1bWVydW81N28wYWYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDAxNTU1MTkwODk3MDAwNTI3MDAiLCJlbWFpbCI6ImxwdWNhcHAuZGV2dGVhbUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImdxS2lXSkFZR3JJVEQzdXY2WmkzT3ciLCJuYW1lIjoiS2V2aW4gS2FybCBMZWHDsW8iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTGZIWjJSNWdoRGpfZ2dtWkxlN3h6dTBQUS1tbS03aUhQNTF5anpDYTR6ZFE9czk2LWMiLCJnaXZlbl9uYW1lIjoiS2V2aW4gS2FybCIsImZhbWlseV9uYW1lIjoiTGVhw7FvIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE3MDY0MzE1NDQsImV4cCI6MTcwNjQzNTE0NH0.zJRWDptJLocHGA-treGVDYw1Hpo95p2T5mjmjY5CtRorv_8XprAyckkaTvcDpsg8NKNqkHqIu3QYiE4rXlgoHZdScJSKvLxBN2iwCLPLuE5O5JdsxOGhi2-XW8mFAfVl3TvbvuKz_YWeSfWn65dmFQEz1AbPe4DJ8ONjDL-XPADdkZcz5qsIeL4y3YjCzPjhLeksm5N0lQbZiNxkBBSRk3mPBoyDG8lSjgXz7CfVQD2NHb4MnK9C6qxvVOxup1i6vSP0lP3k6ND0NMNsrugy66qJjuG4OyQSQtNEsw0DWt4hpHIvF3IS5LpnfyUQvHEd7vdfMeWRlKvwBOrzhoPh2g");
    // console.log(object);

    entry(["", "", "init"]);
    // entry(["", "", "init", "--pro"]);

    // createFireCMSApp(["", "", "--pro"]);
    // const tokens = await refreshCredentials(await getTokens());
    // getTokens().then((tokens) => {
    //     console.log("current", tokens);
    //     refreshCredentials(tokens).then((n) => {
    //         console.log("new tokens", n);
    //     });
    // })
}

main();
// entry(["", "", "login"]);

// entry(["", "", "login"]);
// main();
// getGoogleOauthToken().then((token) => {
//     console.log("Received token" , token);
//
//     getGoogleRefreshToken(token).then((refreshToken) => {
//         console.log(refreshToken);
//     })
//     // const jwt = parseJwt(token);
//     // console.log(jwt);
// })
