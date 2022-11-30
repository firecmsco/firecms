import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const Alpaca = require('@alpacahq/alpaca-trade-api')

const alpaca = new Alpaca({
    keyId: process?.env?.ALPACA_KEY,
    secretKey: process?.env?.ALPACA_SECRET,
    paper: true,
});

export async function fetchSymbolData(symbol: string) {
    const options = {
        exchange: 'BNCU',
    };
    return alpaca.getLatestCryptoTrade(symbol, options);
}

export async function fetchSymbolsData(symbol: string[]) {
    const options = {
        exchange: 'BNCU',
    };
    return alpaca.getLatestCryptoTrades(symbol, options);
}

export async function fetchSymbolBars(symbol: string) {
    const options = {
        start: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 day ago
        end: new Date(), // Current date
        timeframe: "1Day",
    };

    const bars = [];
    const resp = alpaca.getCryptoBars(symbol, options);
    for await (const bar of resp) {
        bars.push(bar);
    }
    return bars;
}

export async function fetchDemoData() {
    const symbol = ["BTCUSD", "ETHUSD", "LTCUSD", "BCHUSD"];
    const bars = await fetchSymbolsData(symbol);
    return bars;
}

function updateFirestoreSymbol(symbol: string, name: string) {
    const firestore = admin.firestore();
    return fetchSymbolData(symbol).then(
        (data) => firestore.collection('alpaca').doc(symbol).set({
            name,
            updated_on: admin.firestore.FieldValue.serverTimestamp(),
            price: data.Price,
            symbol: data.Symbol,
            size: data.Size,
            ...data
        }, { merge: true })
    );
}

/**
 * Update the alpaca collection in firestore
 */
export const alpacaBtcFirestoreImport = functions
    .region("europe-west3")
    .pubsub
    .schedule("every 1 minutes")
    .onRun((context) => {
        return updateFirestoreSymbol("BTCUSD", "Bitcoin");
    });

export const alpacaEthFirestoreImport = functions
    .region("europe-west3")
    .pubsub
    .schedule("every 1 minutes")
    .onRun((context) => {
        return updateFirestoreSymbol("ETHUSD", "Ethereum");
    });

export const alpacaLtcFirestoreImport = functions
    .region("europe-west3")
    .pubsub
    .schedule("every 1 minutes")
    .onRun((context) => {
        return updateFirestoreSymbol("LTCUSD", "Litecoin");
    });

export const alpacaBchFirestoreImport = functions
    .region("europe-west3")
    .pubsub
    .schedule("every 1 minutes")
    .onRun((context) => {
        return updateFirestoreSymbol("BCHUSD", "Bitcoin Cash");
    });
