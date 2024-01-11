// import { cli } from "./cli";
// import { main } from "./commands/auth";
import { createFireCMSApp } from "./commands/init";
import { login, logout } from "./commands/auth";
import { entry } from "./cli";

async function main(){
    // await logout("dev");
    // await login("dev");

    entry(["", ""]);
    // createFireCMSApp(["", ""]);
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
