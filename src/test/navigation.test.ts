import { getAllPaths, PathConfiguration } from "../routes";
import { siteConfig } from "./test_site_config";

it("model routes are correct", () => {

    const allPaths: PathConfiguration[] = getAllPaths(siteConfig.navigation);
    const pathEntries = allPaths.map((p: PathConfiguration) => p.entries);
    console.log(pathEntries);
    expect(pathEntries).toEqual([
        [
            {
                routeType: "entity_new",
                fullPath: "medico/v1/cause_priorities/new"
            },
            {
                routeType: "entity_existing",
                fullPath: "medico/v1/cause_priorities/:08b94b82b2"
            },
            { routeType: "collection", fullPath: "medico/v1/cause_priorities" }
        ],
        [
            {
                routeType: "entity_new",
                fullPath: "medico/v1/diagnosis_exercise_plans/new"
            },
            {
                routeType: "entity_existing",
                fullPath: "medico/v1/diagnosis_exercise_plans/:0246678538"
            },
            {
                routeType: "collection",
                fullPath: "medico/v1/diagnosis_exercise_plans"
            }],
        [
            {
                routeType: "entity_new",
                fullPath: "exercises/:e98fee3979/locales/new"
            },
            {
                routeType: "entity_existing",
                fullPath: "exercises/:e98fee3979/locales/:e4da88eaaa"
            },
            {
                routeType: "collection",
                fullPath: "exercises/:e98fee3979/locales"
            }
        ],
        [
            { routeType: "entity_new", fullPath: "exercises/new" },
            { routeType: "entity_existing", fullPath: "exercises/:e98fee3979" },
            { routeType: "collection", fullPath: "exercises" }
        ]
    ]);
});
