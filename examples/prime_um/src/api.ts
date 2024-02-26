import { AmazonProduct } from "./types";


export interface AmazonSearch {
    results: AmazonProduct[]
}

const host = "https://api-4wkktikpva-ey.a.run.app"

export function getAmazonSearchResults(firebaseToken: string, query: string): Promise<AmazonProduct[]> {
    return fetch((host) + "/ecommerce/search/",
        {
            // mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${firebaseToken}`,
                // "x-de-version": version
            },
            body: JSON.stringify({ query })
        })
        .then(async (res) => {
            if (!res.ok) {
                console.error("Error fetching search data from backend", res);
                throw await res.json();
            }

            // parse response into AmazonSearch
            const amazonSearch: AmazonSearch = await res.json();
            console.log("amazonSearch", amazonSearch);
            return amazonSearch.results;
        });

}
