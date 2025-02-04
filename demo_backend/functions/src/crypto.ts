import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// @ts-ignore
import fetch from "node-fetch";

type SymbolData = {
    usd: number;
};

type MultipleCryptoPriceResponse = Record<string, { usd: number }>;

async function fetchMultipleSymbolsData(ids: string[]): Promise<Record<string, SymbolData>> {
    const idsParam = ids.join(",");
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`);

    if (!response.ok) {
        throw new Error(`Error fetching data from CoinGecko: ${response.statusText}`);
    }

    // @ts-ignore
    const data: MultipleCryptoPriceResponse = await response.json();
    const result: Record<string, SymbolData> = {};

    ids.forEach(id => {
        if (data[id] && typeof data[id].usd === "number") {
            result[id] = {
                usd: data[id].usd,
            };
        } else {
            console.warn(`Invalid data format received for id: ${id}`);
        }
    });

    return result;
}

/**
 * Updates Firestore with multiple cryptocurrency prices
 * @param symbols - Array of objects containing symbol, name, and id
 */
function updateFirestoreSymbols(symbols: { name: string; id: string; }[]): Promise<FirebaseFirestore.WriteResult[]> {
    const firestore = admin.firestore();
    const ids = symbols.map(s => s.id);

    console.log("Updating crypto demo symbols:", ids);
    return fetchMultipleSymbolsData(ids).then(data => {
        console.log("Fetched data:", data);
        const batch = firestore.batch();
        symbols.forEach(({
                             name,
                             id
                         }) => {
            if (data[id]) {
                console.log("Updating symbol:", id);
                const docRef = firestore.collection("crypto").doc(id);
                batch.set(docRef, {
                    name,
                    updated_on: admin.firestore.FieldValue.serverTimestamp(),
                    ...data[id]
                }, { merge: true });
            }
        });
        return batch.commit();
    });
}

// Example usage in a single scheduled function
export const coingeckoMultipleFirestoreImport = functions
    .region("europe-west3")
    .pubsub
    .schedule("every 1 minutes")
    .onRun(async (context: functions.EventContext) => {
        const symbols = [
            {
                name: "Bitcoin",
                id: "bitcoin"
            },
            {
                name: "Ethereum",
                id: "ethereum"
            },
            {
                name: "Litecoin",
                id: "litecoin"
            },
            {
                name: "Bitcoin Cash",
                id: "bitcoin-cash"
            },
            {
                name: "Ripple",
                id: "ripple"
            },
            // Add more symbols as needed
        ];

        try {
            return await updateFirestoreSymbols(symbols);
        } catch (error) {
            console.error("Error updating multiple symbols:", error);
            throw error;
        }
    });
