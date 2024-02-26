import {
    Entity,
    getReferenceFrom,
    ReferenceWidget,
    useAuthController,
    useDataSource,
    useSnackbarController
} from "@firecms/core";
import { Button, Container, LoadingButton, Paper, TextField, Typography, } from "@firecms/ui";
import React from "react";
import {
    AmazonProduct,
    Client,
    ClientSet,
    IncompleteAmazonProduct,
    ShareOfShelfQueryResult,
    Shelf,
    SingleShareOfShelfQuery
} from "../types";
import { calculateShareOfShelfZones, mergeShareOfShelfZones } from "../business/share_of_shelf";
import { ShareOfShelfView } from "../components/ShareOfShelfView";
import { getAmazonSearchResults } from "../api";

export function ShareOfShelfQueryView() {

    const authController = useAuthController();
    const snackbarController = useSnackbarController();
    const dataSource = useDataSource();

    const [client, setClient] = React.useState<Entity<Client> | null>(null);
    const [clientSet, setClientSet] = React.useState<Entity<ClientSet> | null>(null);
    const [shelf, setShelf] = React.useState<Entity<Shelf> | null>(null);

    const [asinsInput, setAsinsInput] = React.useState<string>("");

    const [result, setResult] = React.useState<ShareOfShelfQueryResult | null>(null);

    const [loadingResult, setLoadingResult] = React.useState<boolean>(false);
    const [resultSet, setResultSet] = React.useState(false);
    const [resultSaved, setResultSaved] = React.useState(false);

    // a sample input would be:
    // B07ZPKZSSC,B03432342
    function parseAsinsInput(input: string): string[] {
        return input.trim().split(",").map(asin => asin.trim());
    }

    function updateResultsManually(resultShelfProducts: (AmazonProduct | IncompleteAmazonProduct)[]) {
        if (!client || !clientSet || !shelf) {
            throw Error("INTERNAL: Missing client, client set or shelf");
        }
        console.log("Updating result", resultShelfProducts, clientSet.values.asins);
        const zones = calculateShareOfShelfZones(resultShelfProducts, clientSet.values.asins);
        const values: ShareOfShelfQueryResult = {
            client: getReferenceFrom(client),
            client_set: getReferenceFrom(clientSet),
            shelf: getReferenceFrom(shelf),
            created_on: new Date(),
            updated_on: new Date(),
            products: resultShelfProducts,
            keywords: shelf.values.keywords,
            client_asins: clientSet.values.asins,
            zones: zones,
            amazon_domain: shelf.values.amazon_domain,
        };
        setResult(values);
        setResultSet(true);
        console.log("Result updated", values);
    }

    async function fetchResultsFromAPI() {
        if (!client || !clientSet || !shelf) {
            throw Error("INTERNAL: Missing client, client set or shelf");
        }
        const firebaseToken = await authController.getAuthToken();

        await (Promise.all(
            shelf.values.keywords.map(keyword => getAmazonSearchResults(firebaseToken, keyword)
                .then(products => {
                    const sortedProducts = products.sort((a, b) => a.pos - b.pos);
                    console.log("Results for keyword", keyword, sortedProducts);
                    return {
                        keyword,
                        zones: calculateShareOfShelfZones(sortedProducts, clientSet.values.asins),
                        products: sortedProducts,
                    } satisfies SingleShareOfShelfQuery;
                }))
        )).then(subqueries => {

            const mergedZones = mergeShareOfShelfZones(subqueries.map(r => r.zones));

            const values: ShareOfShelfQueryResult = {
                client: getReferenceFrom(client),
                client_set: getReferenceFrom(clientSet),
                shelf: getReferenceFrom(shelf),
                created_on: new Date(),
                updated_on: new Date(),
                keywords: shelf.values.keywords,
                client_asins: clientSet.values.asins,
                zones: mergedZones,
                subqueries,
                amazon_domain: shelf.values.amazon_domain,
            };
            setResult(values);
            setResultSet(true);
        });
    }

    function saveResult() {

        if (!client || !clientSet || !shelf) {
            throw Error("INTERNAL: Missing client, client set or shelf");
        }

        if (!result) {
            throw Error("INTERNAL: Missing result");
        }

        return dataSource.saveEntity({
            path: `clients/${client.id}/share_of_shelf_queries`,
            values: result,
            status: "new",
        })
            .then(() => {
                snackbarController.open({
                    message: "Saved",
                    type: "success",
                });
                setResultSaved(true);
            })
            .catch((error) => {
                snackbarController.open({
                    message: "Error saving: " + error.message,
                    type: "error",
                });
            });
        console.log("Saved");
    }

    return <Container className={"flex flex-col gap-8 my-8"}>

        <Typography variant={"h3"} className={"mt-24 mb-8"}>
            New share of shelf query
        </Typography>

        <div className={"flex flex-row gap-4"}>

            <div className={"flex flex-col gap-4 w-1/3"}>
                <Typography variant={"h6"}>
                    Client
                </Typography>
                <ReferenceWidget path={"clients"}
                                 name={"Client"}
                                 value={client ? getReferenceFrom(client) : null}
                                 onReferenceSelected={({ entity }) => {
                                     setResultSet(false);
                                     setResultSaved(false);
                                     setResult(null);
                                     setClient(entity);
                                 }}
                                 size={"medium"}
                                 previewProperties={["name"]}
                                 className={"max-w-96"}/>
            </div>

            <div className={"flex flex-col gap-4 w-1/3"}>
                <Typography variant={"h6"}>
                    Client set
                </Typography>

                {client && <ReferenceWidget path={`clients/${client.id}/client_sets`}
                                            name={"Client set"}
                                            value={clientSet ? getReferenceFrom(clientSet) : null}
                                            onReferenceSelected={({ entity }) => {
                                                setResultSet(false);
                                                setResultSaved(false);
                                                setResult(null);
                                                setClientSet(entity);
                                            }}
                                            size={"medium"}
                                            previewProperties={["name"]}
                                            className={"max-w-96"}/>}
            </div>
            <div className={"flex flex-col gap-4 w-1/3"}>
                <Typography variant={"h6"}>
                    Shelf
                </Typography>

                {client && <ReferenceWidget path={`clients/${client.id}/shelves`}
                                            name={"Shelf"}
                                            value={shelf ? getReferenceFrom(shelf) : null}
                                            onReferenceSelected={({ entity }) => {
                                                setResultSet(false);
                                                setResultSaved(false);
                                                setResult(null);
                                                setShelf(entity);
                                            }}
                                            size={"medium"}
                                            previewProperties={["name", "keyword"]}
                                            className={"max-w-96"}/>}
            </div>
        </div>

        <form className={"flex flex-row gap-4 w-full items-center"}>
            <TextField value={asinsInput}
                       disabled={!shelf || !client || !clientSet || !asinsInput}
                       onChange={e => setAsinsInput(e.target.value)}
                       size={"small"}
                       label={"Insert result ASINs manually"}
                       className={"flex-grow"}/>
            <Button variant={"outlined"}
                    disabled={!shelf || !client || !clientSet || !asinsInput}
                    onClick={() => {
                        const resultShelfProducts: IncompleteAmazonProduct[] = parseAsinsInput(asinsInput)
                            .map(asin => ({ asin }));
                        updateResultsManually(resultShelfProducts);
                    }}>
                Set ASINs manually
            </Button>
        </form>

        <div className={"flex flex-row gap-4 w-full justify-end"}>

            {result && <Button variant={"text"}
                               size={"large"}
                               onClick={() => {
                                   setResult(null);
                                   setResultSet(false);
                                   setResultSaved(false);
                               }}>
                Reset
            </Button>}

            <LoadingButton variant={"filled"}
                           size={"large"}
                           loading={loadingResult}
                           disabled={!shelf || !client || !clientSet || resultSet}
                           onClick={() => {
                               setLoadingResult(true);
                               fetchResultsFromAPI()
                                   .finally(() => setLoadingResult(false));
                           }}>
                Fetch results from Amazon
            </LoadingButton>

            <Button variant={"filled"}
                    size={"large"}
                    disabled={!result || resultSaved}
                    onClick={() => saveResult()}>
                Save result
            </Button>
        </div>

        {result && <Paper className={"flex flex-col gap-4 p-4 w-full"}>
            <ShareOfShelfView result={result}/>
        </Paper>}
    </Container>
}
