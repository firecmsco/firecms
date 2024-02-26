import { AmazonProduct, IncompleteAmazonProduct, ShareOfShelfQueryResult, ShareOfShelfZone, Zone } from "../types";
import React from "react";
import { Cell, Pie, PieChart } from "recharts";

import { Chip, Container, Paper, Tab, Tabs, Typography } from "@firecms/ui";
import { ReferencePreview } from "@firecms/core";

function getResultProductSet(result: ShareOfShelfQueryResult): Set<AmazonProduct | IncompleteAmazonProduct> {
    const products = new Set<AmazonProduct | IncompleteAmazonProduct>();
    if (result.subqueries) {
        result.subqueries?.forEach(subquery => {
            Object.values(subquery.zones ?? {}).forEach(zone => {
                zone.products?.forEach(product => {
                    products.add(product);
                });
            });
        });
    } else {
        for (const zone of ["A", "B", "C"] as Zone[]) {
            result.zones[zone].products?.forEach(product => {
                products.add(product);
            });
        }
    }
    return products;

}

const MAIN_TAB_VALUE = "Dwsed324R@WD$#";

export function ShareOfShelfView({ result, includeReferences = false }: {
    result: ShareOfShelfQueryResult,
    includeReferences?: boolean
}) {

    const [selectedTab, setSelectedTab] = React.useState<string>(MAIN_TAB_VALUE);

    const products: Set<AmazonProduct | IncompleteAmazonProduct> = getResultProductSet(result);
    const clientSetProducts = result.client_asins
        .map(asin => {
            // find product in the set
            const product = Array.from(products).find(product => product.asin === asin);
            if (!product) {
                return null;
            }
            return product;
        })
        .filter(Boolean) as AmazonProduct[];
    const selectedKeywordZones = result.subqueries?.find(subquery => subquery.keyword === selectedTab)?.zones;
    return (
        <Container className={"p-4 flex flex-col gap-8 w-full"}>

            {includeReferences && <div className={"flex flex-row gap-4"}>
                <ReferencePreview reference={result.client} size={"small"}/>
                <ReferencePreview reference={result.client_set} size={"small"} previewProperties={["name"]}/>
                <ReferencePreview reference={result.shelf} size={"small"}/>
            </div>}

            <div>
                <div className={"flex flex-row gap-2 flex-wrap items-center"}>
                    <Typography variant={"subtitle2"}>Client ASINs in this set:</Typography>
                    {clientSetProducts
                        .map(product => {
                            return (
                                <Chip
                                    key={product.asin}
                                    size={"small"}
                                    colorScheme={"cyanLight"}>{product.asin}</Chip>
                            );
                        })}
                </div>
            </div>

            {/*<div className={"mt-8"}>*/}

            {/*    <Typography variant={"caption"} color={"secondary"}>*/}
            {/*        keywords:*/}
            {/*    </Typography>*/}
            {/*    {result.keywords.map(keyword => {*/}
            {/*            return (*/}
            {/*                <Typography key={keyword}*/}
            {/*                            variant={"h6"}>{keyword}</Typography>*/}
            {/*            );*/}
            {/*        }*/}
            {/*    )}*/}
            {/*</div>*/}

            <div className={"flex flex-col w-full"}>
                <Tabs
                    value={selectedTab}
                    onValueChange={(value) => {
                        setSelectedTab(value);
                    }}
                    className="pl-4 pr-4 pt-0 border-b">

                    <Tab value={MAIN_TAB_VALUE}>
                        Computed result
                    </Tab>

                    {result.subqueries && result.subqueries.map((subquery, index) => {
                            return (
                                <Tab key={index} value={subquery.keyword}>
                                    {subquery.keyword}
                                </Tab>
                            );
                        }
                    )}

                </Tabs>

                {selectedTab === MAIN_TAB_VALUE &&
                    <KeywordResult zones={result.zones} clientSetProducts={clientSetProducts}/>}
                {selectedTab !== MAIN_TAB_VALUE && selectedKeywordZones &&
                    <KeywordResult zones={selectedKeywordZones}
                                   clientSetProducts={clientSetProducts}/>}

            </div>
        </Container>
    );

}

function KeywordResult({ zones, clientSetProducts }: {
    zones: Record<Zone, ShareOfShelfZone>,
    clientSetProducts: AmazonProduct[]
}) {
    return <div className={"w-full flex flex-row gap-4 my-4"}>
        {(["A", "B", "C"] as Zone[]).map((zone) => {
            const zoneResult = zones[zone];
            const data = [
                { name: 'Client products', value: zoneResult.shareOfShelf },
                { name: 'Other', value: 1 - zoneResult.shareOfShelf },
            ];

            const zoneColor = zone === "A" ? '#0088FE' : zone === "B" ? '#FFBB28' : '#FF8042';
            const COLORS = [zoneColor, '#DDDDDD'];
            const dedupedClientAsins = Array.from(new Set(zoneResult.client_asins));
            const dedupedClientProducts = clientSetProducts.filter(product => dedupedClientAsins.includes(product.asin));
            return (
                <Paper className={"flex flex-col gap-4 w-1/3 p-4 items-center"}
                       key={zone}>
                    <Typography variant={"h5"} className={"mt-4"}>Zone {zone}</Typography>

                    <PieChart width={200} height={200}>
                        <Pie
                            data={data}
                            cx={100}
                            cy={100}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {
                                data.map((entry, index) => <Cell key={`cell-${index}`}
                                                                 fill={COLORS[index % COLORS.length]}/>)
                            }
                        </Pie>
                    </PieChart>

                    <div>
                        <Typography variant={"subtitle1"}>Share of
                            Shelf: {(zoneResult.shareOfShelf ?? 0) * 100}%</Typography>
                        <Typography variant={"subtitle2"}>Client products in
                            zone: {zoneResult.client_asins?.length ?? 0}</Typography>
                        <Typography variant={"subtitle2"}>Total products in
                            zone: {zoneResult.products?.length ?? 0}</Typography>
                    </div>

                    <div className={"flex flex-col gap-8 w-full mt-8"}>
                        {dedupedClientProducts.map(product => {
                            const count = zoneResult.client_asins.filter(asin => asin === product.asin).length;
                            return (
                                <div className={"flex flex-col gap-1"}>
                                    <div className={"flex flex-row items-center gap-2"}>
                                        <Chip
                                            key={product.asin}
                                            size={"small"}
                                            colorScheme={"cyanLight"}>{product.asin}</Chip>
                                        {count > 1 && <Typography variant={"label"}>x{count}</Typography>}
                                    </div>
                                    <Typography>{product.price_upper} {product.currency}</Typography>
                                    <Typography variant={"caption"}>{product.title}</Typography>
                                    {count === 1 &&
                                        <Typography variant={"caption"}>Pos: {product.pos}</Typography>}
                                </div>
                            );
                        })}
                    </div>

                </Paper>
            );
        })
        }
    </div>;
}
