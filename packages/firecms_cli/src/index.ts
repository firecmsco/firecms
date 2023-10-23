// import { cli } from "./cli";
import { getGoogleOauthToken, getGoogleRefreshToken, parseJwt } from "./auth";

getGoogleOauthToken().then((token) => {
    getGoogleRefreshToken(token).then((refreshToken) => {
        console.log(refreshToken);
    });
    // const jwt = parseJwt(token);
    // console.log(jwt);
})
// authInBrowser();
// cli([]);
