// import { cli } from "./cli";
// import { main } from "./commands/auth";
import { getTokens, login, logout, refreshCredentials } from "./commands/auth";
import { createFireCMSApp } from "./commands/init";
async function main(){
    // await logout();
    // await login("dev");

    createFireCMSApp(["", "", "--env=dev"]);
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
