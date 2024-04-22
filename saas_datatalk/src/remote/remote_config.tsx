import { FireCMSAppConfig } from "@firecms/cloud";

// @ts-ignore
// eslint-disable-next-line camelcase
import { __federation_method_getRemote, __federation_method_setRemote } from "__federation__";

/**
 * This function is in charge of retrieving a remote url and build a module
 * @param url
 */
export function getRemoteConfig(url: string): Promise<FireCMSAppConfig> {
    __federation_method_setRemote("myRemote", {
        url,
        format: "esm"
    })
    return __federation_method_getRemote("myRemote", "./config").then((res: any) => {
        console.debug("Remote config loaded", res)
        return res.default ?? res;
    });
}
