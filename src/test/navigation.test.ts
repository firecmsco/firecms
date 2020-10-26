import { getNavigationPaths, PathConfiguration } from "../routes";
import { siteConfig } from "./test_site_config";

it("model routes are correct", () => {

    const allPaths: PathConfiguration[] = getNavigationPaths(siteConfig.navigation);
    const pathEntries = allPaths.map((p: PathConfiguration) => p.entries);
    console.log(pathEntries);
    expect(pathEntries).toEqual(
        [
            [
                {
                    routeType: "entity",
                    placeHolderId: "5cb27a0e1d",
                    fullPath: "products/:d632e6f43d/locales/new"
                },
                {
                    routeType: "entity",
                    placeHolderId: "5cb27a0e1d",
                    fullPath: "products/:d632e6f43d/locales/:5cb27a0e1d"
                },
                {
                    routeType: "collection",
                    placeHolderId: "5cb27a0e1d",
                    fullPath: "products/:d632e6f43d/locales"
                }
            ],
            [
                {
                    routeType: "entity",
                    placeHolderId: "d632e6f43d",
                    fullPath: "products/new"
                },
                {
                    routeType: "entity",
                    placeHolderId: "d632e6f43d",
                    fullPath: "products/:d632e6f43d"
                },
                {
                    routeType: "collection",
                    placeHolderId: "d632e6f43d",
                    fullPath: "products"
                }
            ]
        ]
    );
});
