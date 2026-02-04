// @ts-ignore
import * as admin from "firebase-admin";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const firestore = require("@google-cloud/firestore");

/**
 * To create a new export:
 * ```
 * gcloud firestore export gs://firecms_firestore_backups --project firecms-demo-27150
 * ```
 */
const bucket = "gs://firecms_firestore_backups/2026-02-03T00:55:23_27520";

// export function eraseDatabase() {
//     const firebase_tools = require("firebase-tools");
//     console.log("Deleting database");
//     const deleteConfig = {
//         project: process.env.GCLOUD_PROJECT,
//         recursive: true,
//         yes: true,
//         token: functions.config().fb.token
//     };
//     return firebase_tools.firestore
//         .delete("/users", deleteConfig)
//         .then(() => firebase_tools.firestore
//             .delete("/products", deleteConfig))
//         .then(() => firebase_tools.firestore
//             .delete("/blog", deleteConfig))
//         .then(() => {
//             console.log("Database erased");
//             return Promise.resolve();
//         })
//         .catch((err: any) => {
//             console.error("error erasing db", err);
//         });
// }

export async function importDatabaseBackup() {
    const client = new firestore.v1.FirestoreAdminClient();

    console.log("Restoring backup database");
    const databaseName = client.databasePath(
        process.env.GCLOUD_PROJECT,
        "(default)"
    );
    console.log("Cleaning up document IDs");
    await cleanupDocumentIds();

    console.log("Importing from bucket", bucket);
    const importResult = await client
        .importDocuments({
            name: databaseName,
            inputUriPrefix: bucket
        })
        .then((responses: any) => {
            const response = responses[0];
            console.log(`Operation Name: ${response["name"]}`);
            return response;
        })
        .catch((err: any) => {
            console.error(err);
        });

    console.log("Deleting collections not in the restore set");
    await deleteNonRestoredCollections();

    return importResult;
}

const collectionsToKeep = ["blog", "products", "users", "crypto", "books", "showcase", "tickets", "__FIRECMS"];

async function cleanupDocumentIds() {
    
    const firestore = admin.firestore();
    await firestore.collection("/blog")
        .get()
        .then((snapshot: any) =>
            snapshot.docs.forEach((d: any) => {
                if (!blogIds.includes(d.id))
                    d.ref.delete();
            }));
    await firestore.collection("/products")
        .get()
        .then((snapshot: any) => snapshot.docs.forEach((d: any) => {
            if (!productIds.includes(d.id))
                d.ref.delete();
        }));
    await firestore.collection("/books")
        .get()
        .then((snapshot: any) => snapshot.docs.forEach((d: any) => {
            if (!bookIds.includes(d.id))
                d.ref.delete();
        }));
    await firestore.collection("/tickets")
        .get()
        .then((snapshot: any) => snapshot.docs.forEach((d: any) => {
            if (!ticketIds.includes(d.id))
                d.ref.delete();
        }));
}

async function deleteNonRestoredCollections() {
    const firestore = admin.firestore();
    const collections = await firestore.listCollections();

    for (const collection of collections) {
        if (!collectionsToKeep.includes(collection.id)) {
            console.log(`Deleting collection ${collection.id} and all its subcollections`);
            await deleteCollection(collection);
        }
    }
}

async function deleteCollection(collectionRef: admin.firestore.CollectionReference) {
    const snapshot = await collectionRef.get();

    const deletionPromises = snapshot.docs.map(async (doc: any) => {
        // Get all subcollections for this document
        const subcollections = await doc.ref.listCollections();

        // Delete each subcollection recursively
        const subcollectionDeletions = subcollections.map((subcoll: any) =>
            deleteCollection(subcoll)
        );

        // Wait for all subcollections to be deleted
        await Promise.all(subcollectionDeletions);

        // Delete the document itself
        return doc.ref.delete();
    });

    return Promise.all(deletionPromises);
}

// const bookIds = ["1IyoAlXhx4vg6toXU5nG", "1tVBKKuHgDYo4aI3kP6V", "297XrZBN2cu9SmwvHeau", "2aLCkk9gDkTIYc6Bcdnz", "2w5veXKjiMoB5nrO0vW9", "3f8sbTA8sJb6ZYN8A4hs", "478BXQ9rmGyKtSwO4Ec4", "4D8v8GPRFrwR2AFUN0aY", "4K95UWRDTuwQWfjrOPhB", "4abuVrnhtP9ZjQRnKNfg", "4ewX3ZUkSlCv0YBrbrF5", "4qkn0OzqIbWhkFCAj794", "50n7hB2uc6Xvxub9QkGO", "5LZH3aA1NX8VF2yF6YLk", "5epL2Cszu8QDAE40ZZfu", "5gOTnn96P4y3EI2Af0hC", "6IZxdYu2ttsRKCepEMCI", "6KwsIYqfVkSS6K31T8D0", "6aNNUPm4WupZTh1Spke3", "6bkuZQkMhtYvwqTeQdAZ", "6l1mYEKQBLOZVEV3gaPX", "6w6t10gBsjkqoH0BOu7t", "6xTlLSEIQ1ffTQu1rZcL", "75mmM0gTr0DgOuK3Vkbv", "7CBURrokmzY9jQqDtKm3", "7J91o7s92Befx1LBIRkc", "7bAoQQGHvI1IjeWJ3WEo", "7eV3EunZ5SUYJOlIkpfX", "7jRQOaqzHnN948wMm9Jc", "7keoHb5XiWTu7cifBuXa", "7tN9HBNqwjTVbdWZkNY3", "7zIjf4dkzfysVKCGBYE1", "7zsyVdO3i0bnyFaMtocT", "82fiCeEXWGKlc5Ayg7YR", "8OP6JpMqpmOgJXf067tN", "8VV26WWdkemomPgCwauK", "8hxelZ4gwlFaY2Qsf7TW", "8iwRhCw5i2BnLRMGf1KW", "8rNr1JiQ6JpwRB8SBAgT", "8zeNcb1DmezncB1MQ5r8", "9DItobudmGuPo7QUD62N", "9DUqnmlgsfPMSlP8VUxi", "9IyKdVqwLeTQfemNYDpD", "9aPv2EdGCCf9uqaU99Le", "9k0yHEfUGIcVQOHr2SeG", "AA4yscRVhuZf2yAeDMEr", "ANWySjtfrUKcOMSUYdBt", "AWeQXU5LAE1xcidX7FTX", "AeKrR4txHkMne2iEyASe", "B2AVhQROf1LMi8Gs4WZg", "B5CW976QjS909T553kw0", "BC60OzeRBFiL4enQBxUV", "BOmSFsEiYLd81T2ro6dw", "Bo3gebFeE5pUAZssN3Ge", "Bs8MtLkPaAdiAV07pPSK", "CFyKgwSVRkE4gPa9a5zK", "CFyWp36yClXAPYvoKlcT", "CNeBDsONHnpWm9hrursZ", "CXtX9csD7f0LEBSzjKm1", "CblA8qy1hS3uzt7DUz5c", "CeE49baKiDqmGVx3MAuV", "DZmNlmwVV2btZopcqzzR", "DaoVPi5ARG0UaIEMNngL", "Dicm3wXMWMgyRsItgL2t", "E7wZzzEYaF5ZH0jVdW5i", "ECLOvNWGsXXyJU2B9KWR", "ENaXYmVGzeVkmvYBIob4", "EVCdL1f4glHzsXoh7WcG", "EjYtoq5qmmZ5XnAMbWAA", "EvwIH9H73VFquVRsv0hi", "F3gznQxXkJG2rwmcCtoj", "F6qrYaVuh7geoM273PK2", "FJix4xnwHh6vIHGD58s6", "Ffu5L1PjAt7PXwEbWvti", "G8YED58Jxp262zQu9wC6", "GHu1xMv4DlVyxeCywwZX", "GMcfo617yrc79Fx3WEfm", "GS3oc62rc3kYrMpa6S0O", "H4inaqx77lb2Zyej4dP4", "HEnxI3VSVvEbOjEogVrr", "HQ8eFI8ceWHakWUz3Ap5", "HhCXWBQpRjgh6CQbX7hi", "Hle429y9pkc6ZJevz09w", "Hu7EpK2lbqisp9tt4oWX", "HvVyi5qMGwtQmUYxkBQB", "IKkjaLDNv1CbeQtoe5xv", "JD8qog08ujjlVLG1F5ZX", "JIcUa13BGPPn54EZhHWW", "JNKh06W0EkrFPaT5Fjsz", "JOtso9W1bD7qIpH8kCxo", "JPrjtsyY3QjBled1M6Fz", "JdGeembzJPsNGa9emEmT", "JdgeNOXq6p3JyglYDyxr", "Jlfsrt6zNypkOk2zREld", "JmnXjexsj5jg44G1wnkg", "Jowfj0ZK1LoktmPVh8zz", "K3LlQRAGXhHdVvD21Ah6", "K4uGFDeJsTDdtLt49bNm", "KJplFw5obNagEfUYN80Y", "Kj52GOBLh9XixD47x5Lk", "L2MZiz1NjXBdq8rYmZNO", "LIkV69WlJwZy8RZy0y5U", "LPfZ3wbq2jz8flVshxR4", "LjBZhVv7bj3YVJV9LohR", "M4TZucK4eBw4tXmFioyY", "M52NBKJNE3xmePvhmrp4", "M5Lml6Qc2COMP5pDbnUi", "M6oivIHVqwd1OQ5BwkAl", "MIjAgpuPomVrbz3H6wXh", "MIrMwNY3nAxsMcujhiSA", "MUsEffKoobfnbHJkkEau", "MsQAprEFesNXfEhkpm0F", "NDCcGIKop2ZKf2aXtQ3e", "NHJXtJGq7jGF7jYUCQVv", "NTDrrlk76Zqm8FR0O871", "NsoFwjSbjHOqPc2cK4O2", "O3UPJjxWFlk9eUYnGujw", "OCreuhlHOh9Y1ypQBMPI", "OGIWnIbYALuQDL9UUVrk", "OHdQGElmNVGUkeH6ATqj", "P9UbM0EdQnGgAEZDTPld", "PIzujejjquCxdead9LD3", "PWvGkLIFjJDDetGcHxao", "PbiQfayNgiNoFUCl0MIo", "Pbxld0tdYO2xPrSIz21u", "PscQVE79a9ColwzsQsBn", "Q0xV9ylddXeGWZeHdJLq", "Q1LI3qnM7UyTm911UO5M", "Q7W1ZJaGjxZgGhcm00mk", "QEdgYP1TpmBNNZEInzyB", "QQtAVu0CdnNt6U9F2167", "QYm7sCuczCOqlDO5INi5", "QqsbVGTDOBJIJ1Ge9JLU", "QqwXSazDUbQQzdJaZFN1", "R5NTsbwkxbF1ZcDm9xcK", "RJQVRudn0uKWd1EX385q", "ROTB40iBmgOQwbzoYYDg", "RS4Zr8jk3FCzrKsF5XVW", "RWnNx3uu6UEpGC12NR1Q", "RYhGM4mnhFoEHwS0Cdn6", "SRQ1diCfjcw9G7fUqBcB", "SRzND0tnGzyqlbu0FHRS", "ShkUvm6xf1nsTMqgiB0f", "SjAxMLQsn8gtjIXJUfCU", "SsEC1A3cO8Yy6hpHYYnM", "TPYImrxKdT7EmU5Uogkq", "TQPTgUxew5DK91Nhc7KL", "U4K3xL9ycf5AlBJ3KWYG", "UBbYhPMhfWclrVAOPWdL", "UihrTKMiEGdomRPfaUAD", "UqYnThLDWYLnDUYRiTBQ", "V3ucmIjKshu0o9rfWVVJ", "VXIUB3kWin0RFVWUQIvg", "VwC3gXASCDuR8Y3MX61y", "W1AhMYNIxgpjVrRYVUBg", "Wh7P6oIuWWcGZnAeSLGC", "X5yoXrPhleDFeCMxopYB", "Xp3bCgLWOdl1no1IJnuf", "XzieeSGTStPIiOcpm1XW", "YDUbtod7yjGE3J0pe0Rc", "YJTrIFeblKZcPuS1kDVh", "YMd9Y47D9cZ9NccyzMJq", "YQ3IBOndg2qKmeHW0gMM", "YaiuR058qMaEBa3t702c", "YscjOq74MSEADDU3mrOM", "ZAI86HLUj87Gt5l8862I", "ZXXllpCBPz4eZSLsahSn", "ZZI45jM3Owq1ElohxOBc", "ZfmOlBYAfMybEWPJ78LP", "Zr8E5KPP6ZarrIQnXlmL", "a0yaNvu7L3G0q3ffQppZ", "aNyswkCBPzDa2xnuOxtq", "acywFxhELIR8XvFmnzcb", "aeMdJ1FCNEKmI7vLPluT", "b030WADksmPUqcEKYcbn", "bAPr6AbczmHEzyYXjvvp", "bDEnMigUwufqdMAMM8zf", "bFXFID937FtCsmxNcdqY", "bIYc16jBHMvUCGSZbfDl", "bQHJkPOLyn3funlkQb6p", "bZTuAkWnRvKXfwmH0pIQ", "beH3NyxChVcfqGp6hARH", "cBlFeSAFGJDlEkmOnhU4", "cEd2V3cDpTHsv1V7IzIa", "cTZN00B1z2W42J6zjEBx", "cdkJMzjx3ZdqrnKfDTL3", "d8pFdXEJ9QpKMuPqRCbe", "dQpnMVFE3SpcSg671Pnb", "dohvJnf1cgLemGPuyz25", "e0SyrbVyXTxbk9S0Lp6r", "eEswkA0XydXO2lpRHNWZ", "ePSGf0oDKEPInyEJQ95P", "eSGHxHWNJmAR0bOPyFLg", "eaRrdZVsp1VovkjRUQkX", "eiAtTtXI9PJHLfHBhX9N", "fOQ2uA36pSRfkOLWAAIx", "fd7yTjI10EvRBWUhtztp", "fie6gAPSPKv7h25udgs4", "fsVHCugEFcELM36rz8zf", "gBqoAfABxLz8hRWEIYe0", "grjYmu28lhlHpsPSDJ8M", "h5wRdBlcqDgxjx5hwtbg", "hDtjnjLw3P8OmRYAVp0Z", "hMOocJvZYXrlHKcmyO5A", "hlaw9jNVSrf4bV0kBuD2", "hw60N0UVGNn6h0b3Owv1", "hxF7OkZL3Zp5cneJEgWM", "hzGcqvwLj5NemPoTEtrP", "iSoOqc0wSJTH3jKGlG9K", "igB2oIFONObgxZFeODXO", "jBIIJJvB1Qq7hkinKEuP", "jNGK6fD7jbclxoGRbiuj", "jY2CzUXYfsdv7Tf5B6IM", "jhdnLJ0RXvIxQld0nfEr", "k1xz7aToEcRYeR6SBi8V", "k5cKz2gP6QT5lHUSWL9E", "k85FTtuoKoRICAm1MRE7", "kWsGl7ca6DlGAuLICkla", "l24WzHjWcjJdtj4BZyDz", "mm2JB5fxZVz7BNRKZZGc", "n3Mc2f5HyOO3Y3XaiQJF", "nVqss27MKPvfABvKCYsN", "oHKYEMt7DT93XBRSGD6U", "oLizQO06yAAAwJwTmZ2M", "obny6nrUtbTB0iJMwuWM", "ofIUStlYx9L0LRsABSpF", "ovKlxMJN5DzF5Bs8afq4", "ovcjgDG5laKPvfGWZwcF", "ozDcq5SWHL0t8dLAng9M", "pLJYFuhGlvLFYk3jbGwj", "pQuhwcm9jCX6RJLxq0qz", "pYc7rHq4Ma7GA9wiwpxV", "pf1GMuhmdmjTGNagaLbD", "qCCQkZbJuW7cxpSxGWRJ", "qrc0lYvxBrccdbZK5pQy", "r5QQN9VCBVdo0QIeI1qQ", "rGgsVroIEBFB36DzlSDl", "rWA19tkTuvwUylGdNLMH", "rX2nTAgrqFdNyf4SaHFe", "rsLVxKNTTWX6MtpIqvIq", "sAbuxVm1Gw4BHI8E0GBg", "sLomno9bDjyxyRjDfPtG", "sl7DWLFUzNh3jmQw901F", "sxBpWIcyg8JmM1JQ0vcq", "sxEKNPMach2Kuwv011iM", "tCpYhNULt9r473K2beZO", "taiQnr26zrJG5TJDYc8F", "thsRih1ElBYuyBkrB0hJ", "tmT7G1vJbQV8CYUMIcsd", "uOznSuMS5EM9us0GzfEg", "uYxB4VBT919lPTXVFgSI", "uxiiRVk63j3O9kQnam06", "uzV8JvwoAglqKUlqfJeW", "v11mmUzAgJZDZvOG08ut", "v97qCQJgsRGv93qwsQCk", "vG1r8pfJ07vi1vmZfELI", "vP2sydxs2tNMsfmqudzM", "vUnRqCVgmv7r7GRDNSyC", "vXFIfhzcIN9d86LAld7Q", "w2XOVFtz2KQuKRtydL1y", "w3NTaahTzDomeCI0EUu2", "wO1iM9XHYsT4tORhFshH", "wyqi6l0pBh5TBSySksTl", "x8bYXWmkXzXoMNo29mrx", "xLUO2jj73ytYfvynE2nw", "xReuHWYZnlGrhOv1xWJB", "xSTAa1GNApoXiB0YlseC", "xeDrOpAr2r71TVTNFfSm", "xrNlb1udPM6ly984Es0o", "xzv6FuQRyZT64G768gOZ", "yFhOnxE2x1gxGBGJi8BJ", "yPS4c76TtclHDhtSUYSD", "yWIiUCVWiLhkRNXKe8VK", "yXc3hz4aOk9CvsavZAJ5", "yvxBpyG2JdnUot346rBR", "yxz10jPxlz64Q9TT2L9f", "z05F3mdEtraKF44WIIrc", "z3anWNQlHGHRzEtdhvur", "z5s2IKOFubbqD5lErwbj", "zMtHjl5j5wILjiJeBlnj", "zaHvwDqhqxn4uhQXtydq", "zlj9RNUsstruq5eUm8Im"];
const productIds = ["B000P0MDMS", "B000UO4KXY", "B000ZHY0JK", "B0017TNJWY", "B001A793IW", "B001DE7P7S", "B001M8APXG", "B001UQ71F0", "B002LAS086", "B003NE5L72", "B003VV2SI2", "B003WT1622", "B004BV345C", "B004CKKJAU", "B004F58UE4", "B004JHXZHK", "B004MW3S9C", "B004OAKGSI", "B004SXBYOQ", "B004TEZD64", "B004UL4CTK", "B004V3PS72", "B004X4KW5M", "B00524SSFS", "B005DDYGK4", "B005M8GUOK", "B005Z7C44I", "B00696XABA", "B006CZ0LGA", "B006VA6BS8", "B0072GHH42", "B0073SYIB4", "B0074I34YK", "B0079G4ZH2", "B007CJKEZS", "B007CJKF98", "B007GC4ENO", "B007N8XE5A", "B007X5QKXQ", "B0088LR592", "B008VLI2AK", "B0099PEVA2", "B009DGON1Y", "B009IQAM96", "B009MP253O", "B00AHCNQEI", "B00ARPM4XY", "B00B98P5RA", "B00BQ9YK2I", "B00BZQPQLQ", "B00CZGPH9G", "B00DNV8QIQ", "B00E9CX1NI", "B00EO1TJ26", "B00EV5AT6A", "B00EZ37SN0", "B00EZSQA84", "B00F6EPKZ0", "B00FE9XGVM", "B00FOLLMX4", "B00G4AANFM", "B00GD57874", "B00GHOJRN4", "B00GHR1CF2", "B00GO1F78O", "B00GYKB3FG", "B00IJY2W8C", "B00IM2XI8E", "B00J4L57C2", "B00K2YVZIK", "B00KLEI6XI", "B00KX8F9DW", "B00LM3ZUOA", "B00M4YW15W", "B00MXCZ5R6", "B00N0XSP4W", "B00N8GWZ4M", "B00NEZ8JAQ", "B00NIYNUF2", "B00NPWDE1W", "B00NPZES46", "B00O7XZCEU", "B00OHV8KUU", "B00P6JCK1W", "B00PJSUN9G", "B00PJSUNKA", "B00PXZHB8Q", "B00QX6LLSK", "B00SBW94JM", "B00SRGPELO", "B00TF8ZJDQ", "B00UAB4LKO", "B00VIB8KBQ", "B00XJJ62RY", "B00ZTUWY8W", "B013X843J4", "B0148WVSRY", "B014DEUB9S", "B0152WXI0E", "B015BA2LGE", "B015JIAGE2", "B0160RBTR4", "B01610OP3A", "B017W1IP6K", "B017XAABR6", "B018NJ4FIC", "B018QRGT3U", "B019DWKYKG", "B01ANF62JO", "B01ARNPOT6", "B01BC8CQRS", "B01BD1WTN0", "B01BVV3SOQ", "B01BW1Q6W6", "B01C4VZ1EC", "B01CLLDZSO", "B01CNLAD7I", "B01CP39DOS", "B01D3V867G", "B01DNV0AS4", "B01DPV0QEK", "B01EGSB6YK", "B01EZAADJ8", "B01FE84REM", "B01GG1BHQC", "B01GJ3BL5Y", "B01H22KJAO", "B01HB88C6C", "B01I58TWLG", "B01I58Y5RW", "B01IE13DZU", "B01IF5YK8O", "B01JKD4HYC", "B01K4LESPM", "B01KXGQU7C", "B01LVTO7FE", "B01LYA0GD4", "B01LYLV3DR", "B01M0OCZS1", "B01M4GDHIL", "B01M5KIMRQ", "B01M7SFUAJ", "B01M8GM3PH", "B01MAY918M", "B01MFHOEMY", "B01MQPK8ZL", "B01MR5EICG", "B01MZ96Q2J", "B01N2SN7DX", "B01N2Y7OWC", "B01N3XEL7M", "B01N465QHC", "B01N6QKZPK", "B01N7RMA2G", "B01NAULLPX", "B06W9KC9QN", "B06WRRPFH2", "B06X96QVDB", "B06XBZMXQY", "B06XVZGNXH", "B071D5JBD2", "B071DZHMVN", "B071P93D47", "B071R8F6KC", "B071RRPLC9", "B071SKNWW4", "B071W32CHS", "B071Z77Z9B", "B071ZPSPNY", "B072811S5W", "B072C3XHLS", "B072LW4CVQ", "B072LW4CVW", "B073HCZ2LX", "B073XNFYCH", "B073ZJQ3SP", "B074ZSH2QD", "B0753L2693", "B07565G7BJ", "B075CNLCTG", "B075JSP8F7", "B075MN16CX", "B075TZYRXJ", "B075X36DCR", "B075YDNKBY", "B076CDLHW1", "B076CV2LBZ", "B076D7LKCC", "B076FY9FXD", "B076HGTQBY", "B076J7WSPP", "B076NSPD8R", "B076X9ZFR7", "B076Z3QFFY", "B076ZY34HC", "B0778PWY85", "B0778VPDK5", "B077MLKXT3", "B078S56PCR", "B078WWG2VC", "B078Y47Z81", "B078YP43D6", "B0795TD478", "B079DNZP4T", "B079J9XP7N", "B079P5RRHJ", "B079PMRMMM", "B07B47DR1C", "B07B48PY3D", "B07B687Q69", "B07B68BBZN", "B07B6SL183", "B07B8JPYYC", "B07BGG1F7L", "B07BH2S89Z", "B07C3HNX4H", "B07C5FVGHZ", "B07CG23Y1Z", "B07CGSG23C", "B07CMK13ZX", "B07CN8YS83", "B07CTRCMT5", "B07D7YFV1V", "B07DHRJ7S3", "B07DVT6RR1", "B07F13H9RX", "B07F2RX84T", "B07F9Y5DSB", "B07FD6ZYHT", "B07FJXVPQH", "B07FQQBX73", "B07FXR1JLN", "B07G7MBP49", "B07GP94SV4", "B07GZ9Z9VL", "B07GZNGDJJ", "B07H5K86B4", "B07HDS9V2W", "B07HNMN7TM", "B07HRHM8F3", "B07J6MWYCP", "B07JHZW7WZ", "B07K8TW9B2", "B07KFNKM1C", "B07KQHCHCP", "B07L187TT9", "B07LC4YX61", "B07M85KSPR", "B07M8GN9HT", "B07MLS13M2", "B07MTHB1TF", "B07MV7CQFJ", "B07NLCYN6B", "B07NQ51KS4", "B07Q65377Y", "B07QC97CKQ"];
const blogIds = ["Ewsn3fq2tfLiIZg8uwzM", "OLRPBl5dA1JZhcSlhLkF", "aD11ISLz4zgxOei5q9Es", "c4o9TlWEDcwCJoifI6ra", "lB9HSU4wF4cSxdFC0Uro", "x20cgjhZwjYCA2XvhF9y"];
const ticketIds = [
    "48AFc7IyniPod7eU4PxV",
    "4WAnRBtuBq4k3znjE8Zb",
    "6wUSmb423ONSckvQ4eBu",
    "8zNhVeHJaQfq6PZbGsRZ",
    "98hEL1gslJQoLrmPKuwW",
    "FMLE46q1WYg96YaEtipO",
    "Imbuisp0klGRKL06854E",
    "J8UMjHISLvJG2UA1uj3d",
    "Jmq17hidu2TxHcZ3Hi3k",
    "N6bgp57nrHtaP31Yfd1Y",
    "R4x0QW17h9MxAtHOKfR7",
    "Xpf631v4du3gljNy0KRE",
    "akU8kY2GmESWEs37RmHS",
    "bhS8P5NGqR7evreCZqMy",
    "fOYbdAlrMu2nz6NSR6UD",
    "iqltp3GOcDQ3yC7fCVsn",
    "jTSaF5hDpJbGuImKcmde",
    "mxKZQzr9JSGTXkMleuVM",
    "ojz15jg82dEvgpmZ0XD2",
    "qjeQ6JAuzgbYf3F5LPIj",
    "rvzibX5fFlPfEWVpvy2O",
    "tSrCNpOiOW81KQ9lOWp4",
    "vNfh7YFfbNfe1mYxiqE3",
    "wTths1RTZK3Nmz0hW0Mt",
    "wcVXdn4OacLc7ykXJECq",
    "xlDHolPVrBKxWQVkr4jf",
    "yNvThVEgwzAjtGo0bFAT",
    "yh7vVyKfxY2x8jOAmBG0"
];

const bookIds = [
    "300273bc9757d9ce18f22b833bd3739ed61e03c4edf7ecfcec35ed106a7b0dd1",
    "33f5f230ad452a80f5e3d006d298d3711884ea17bad898d571a39acc228c09f9",
    "345b667a1a2d3ec30ebe7b432ad5486beceafe39995421a7d4633871bd4eb318",
    "35de2da495048b4f43abec7981955ec21ffae67cedbac28944e5f00278ab06b2",
    "360b4a4660d11631e7a754175ea8dede3356e107524b5cf290bd921fb8f2713e",
    "3630647a59bce446d879f0877219cf73e5bf1b789105831850a027d17409844d",
    "374f0169d63d6038cb9aa129013e0db4b2a7b46077b7d844df8da1796be67eb8",
    "39e04d61c12421fe8c2c61c1a602b8d766a05c86cb247bfc0e07fc976bfb4332",
    "3a43f2922ed8fe2089ef5614eb8ec4b62147ce41ec8d64b3616e10f7f7c3712e",
    "3afb713238077c7059b30917391f2aa3836b3018b89b51876c5caacccd098daf",
    "3b96ff7e58a88a96d532c6e537baba82623b31b5b2f2524362e9927a2510f448",
    "3dc151f0a9d949e02f8af3158c0a0d0c1d0db5531206e7e60a2745198755686f",
    "3ec7e7ae4d108a24e217cc6cde003908ae7f591f98c9604f78ac8703a5d87e41",
    "4088a4992e54678a34423bb9c3a05b35a4907f1f38236ada4f9014284a77bb78",
    "43002d506f4fa0aa63484c111795e810ee3d5d5024da3262022535ed17f281d5",
    "43990a2651d78f130c1cdc5850259ed0a48fbcfb1639c1775d27edc01f0709f0",
    "43fbbbf2d025bd9a6ccdc8dc214bb9780bba0ddfcefa945ce4eddf9b50996f86",
    "465ea706572159330c3edd10e9e6ada91a18aad7b1f68fa747ccb0e0af95ac24",
    "47aac3bb91475c7fbe1aa054deb7bbfa16f5762e68af0cce118f4a717eb36e6a",
    "487386982e9f732bd282a8d3986cf9c54baad310f60ea08eb3f30e0de99a39c3",
    "48c0f98a7b842ed5a8a81850b995d2490b5787ec470aa33faee93ff5242ce25e",
    "4b3462d7572644fafdeeb0c70b3a49f723838fd68a2c161bdf8a8f60ecc4a50a",
    "4c70d4743286d56a2af7ed5da93f66e2f3c901a3044b89848622430bf9815769",
    "4c7fa0bd0d8ac48aab4e5d7c426bdad9973910220696788cbef2d5516d601312",
    "4db5b9aa7c00ae59d3e5fb7509362da4db18cfc664f0417a14af689813ce9002",
    "4e0d1396cdbc33ce96ff609ab19800c0513b7ffa2e6742f37365fadb33632a28",
    "4ea011d04233ae94884ea369f06653f3fa0b11abffb593a77a605a3d6e0d6def",
    "4f946da92e825d36f42d76f8d79723094caade546bffe11455e744c43a6d3068",
    "519e8f86939b94c1e15aa732b64dbc802634ed312fa4cb6f59d68ccd38bc8649",
    "51c62d69a62c78d9a8335b92025008fb49c7aea47a92271f07b54a6590820e25",
    "5211f1c704e93dbba4fc6e43baf1ef3a6b8518f5d5c184c2a4d42511c2b58aab",
    "52360dd6a09a8f196ce8cb8a536f7b08beb64540585c6ea8df8c8908f0e41040",
    "53dc5439d0dd54f20809b59a631be592b356d0f91e7db860d784227e61129b3f",
    "543e86b506627f7ef310c1f458d256fd43c5e7c6eef7ef8f6367450866e58198",
    "55f9712ec7fd71143eb265854f20a3adf677ec87b3e3d4c82ce32218459459ab",
    "56a06a8cb4ee534e04a2bfa0c82b62562ab5578373c1b471e9cf2f723ddc0d6a",
    "56b53c1e2e26c8ed22896041ed7f7fe54d508da80331bbad504a52b4976067c7",
    "56fbdad23f2e04811af606aeba5c8de4235973e224ffb32954e7f78f5c8c2395",
    "573875936a2fa83950ef677351082eb1e711579d07ba1ec7971e92a4589fe0b9",
    "5a714412074c61beb337dd575e34c416460d6b052094b35aeaf7c2620bc0b81d",
    "5cb6b5370bed330825044308bd060ed7cf79539489e3b61fa16a1d0a6cf7e692",
    "5cd78d0ab1f30fa343b20ef648d8d6d6ae975c8397eb184ae785ff01085c4ca8",
    "5e4e0d7cced014ebb331a6268e37e8a7da9512fa1bb830bbf434758169730012",
    "5f1a9e98c943d82047dd3205d457829aee24fe8f165d4bf7375769803fa13a65",
    "5f93d6f90cd7d4772cf6eb3dcdff557bae4bc0aff311ad478f2a522609203848",
    "6146a2cf52402be7bbc141325f2f3e35339e18d5de681803b0c3c64f6cee9dc9",
    "61d1b18b5cf8a85d9f05f6e02c1079e38bc22a1903fc2ad2128ae6988d4e8502",
    "6926f2bf8bc542620db47571a88c1da761c976744ca554833c4baa917acd0e20",
    "6add1fe7f28222eaf95929c9ea158fc564653d8c24fc981553089763dd098361",
    "6b016b44b0c3ce8859c2a25e0ccc028e6ed31ae3beb20ecb72401b8e399c2fb9",
    "6ec1ea3801976fb0966e148ae6a0fa620559fc48795435e2ca251b4dac0482d1",
    "7158dbce76371893e88d1cd13819e89d1cf58ec5ca9abe5fd30a5fa17d120a40",
    "72a793ef10fc125b618697ae2353fc0ff457e225c5011b201d4614bc9778db67",
    "72da1e002e899256cafd12b99214f28e6c4ea7bec249c0a8877b3060653e37c9",
    "732abbf2b7868404927509a5721a2aeef1b79f1ffc5bc0ad376fd344990eb744",
    "73356a64ca6d7af9291dfba3e3c92c4a811cb963278aea34f98cd60de923c384",
    "739cd831ba1f568538e4696aca1be431e7aad70fa653a2cedfbe721d3ec27d39",
    "743d11f74188905bc8b8f506c6263b6df5a169db0aade51eb4c34b0191ecfb4b",
    "77315d0e773f5635c40289d118048b72f59045e603a5ccf45351f57fe3fb21da",
    "77d94d51c45c1fef9a50da20b45cb80584287790527fb01f3ae2a178b7999fc3",
    "791b111f654ec29673999916fe34257899b365d1126439361929bbb8dc562036",
    "792fac7cca9b4f595c29081925d9a7b80a7d689036b42e1e8ce3eb66b059abee",
    "7c7baa818f6669ce0839b632d45670173da3eb55638d17b62b77720cd4b6e7d0",
    "7f806dde824c80e5a4d6b6402852d95738d22b82336d01a655b4f5ae0eb0162d",
    "7fe57259eef6af9e618a30597fd537f8379e860b57bfd75164b2ea3e96a9a594",
    "80544bcb69d4f97aed02c2377213195d602bcb56fc0b34bfab05200d397187cd",
    "8838946b8f6a1ddbaaa052ff891ddf2e99cb32c31ade5a078419ef8a031478d8",
    "89d8320ff1d9499e54529454bc40dd51dc1f8c0d987740a7bfa98abf0e048051",
    "8a50c74630c5e150a55c197dfb4dfc9f7d4f184b63cce01705e15d220008232b",
    "8a6a32d19c26c454a4b78918b3634a06721663576d283836e871321b8bab2d26",
    "8a891c14e8bbd54a79d38f4aef99e92da413f34b84db869317a6a12e591f31cd",
    "8d4e69547cfb4369fe8a211c5437a46f413cd3c30ebb55f838e166116df42a39",
    "8dd30649690ece35fc9b9d6c2c6422e46191469c870d631589e7393966c12d80",
    "8fa9757477788e61eb2face19b1bf2ebb79942b986c72425eebc202b499a8ca1",
    "90230a24ad643a86d06e1a50637febf541182da6dba160a6a7edf7bf89f1740c",
    "912df7bbd0e43ee8ab870ba12ccf7b0ec3ad81b82013bab083b975cbfb635566",
    "9500aea8ac412c434316c13b8f6852382b789a7f06d14aeee881a09b7e716406",
    "960b21d2df10ba2946b113f4883ab4c00222a46777f6c0244719d9cd43df05e5",
    "99ace1b7208cdcdbe72d3b3eab9d983a58ece577db33dbdaeca8b97cc10c257a",
    "99eb88deb682392a63af940498dc77495394de9c1c7fffd3c7b83553101ec3d8",
    "9ba934e16fcdd587b3d1c11bd30cd0b6d5604f1a7661e915c05b0fe0c10d9743",
    "9d49dabac88a88f3afa5bdece5172d462a6413a151d08e44e6692dd4918f9178",
    "9df4da4508f3dfa262bdbe39a16dc70e39be9ccd0509ada0a74d1645a30439e3",
    "9e11284d6bc5255487e0d345c559b50109036976bffb5382e60fb8cbba334386",
    "9ed77156e3d953f0ca28f27fbc39bd4684123e9850bb1bde50212c15ba9aab05",
    "a030426af9c1f7e8b487d1baa055ab6bc8db93ee59579e5548ce1f57853a9414",
    "a0a81dfacf0763347e71a239eb94dbf9255a0d44355742ad56e12ca44c1265c5",
    "a1c7d8c60f4cec0b61def821fff262719beae101455206206aba82c583cf6927",
    "a36e9478bb51cb1043a8da4bb925db71991b13a6164358b416d2145648ae47ec",
    "a41c6cc0236a5655b438e17e6169accd6a72eae050611fd61321f8234c344bb6",
    "a4721a1624e66fcb043804d505dcc1fb50b370fbd653e255eabfad11f52aa7a5",
    "a9eedb8d31e0539840455ef4d334482ea5ced73f6eb957edb1819241d6ebe045",
    "aa48c58ce51304323b45852fa199e960fe82d7e3b1ac5c301ea57e7c1ac4963f",
    "aac8f75bff7dc40aefbf27d5d8a5660fd50a781377b6b64afab122164bda0ff6",
    "ab024b689f5f3bea8331944d69d0c8777b4eccb88ef82807d2d44eef201dbda3",
    "ab617abc6311d9ffee320fbd96faa9ce306c0a874a35569e4b340d51833b2281",
    "ac36e73d97f94704713adf968abace989c368c8dd7503cd3fa900b9ab633c7f3",
    "ad632122af64a285af4ff6157f22e10d1e613ded447fbf6af1aba9b421017dcc",
    "aea4d87ea62733bfea64b82891dbb8de4e6d672291e7b53b9bd68aedec74f68e",
    "b06e1e22e49fbc8fee116d4b9bb7d59b0d4de1b2edebe0a9ebf244bc2092865c",
    "b0841f508fae26ba03f0e2b367d82d90f4eb081461083d2255bf3c7729d70c5a",
    "b1bc95d4edec21da7828d9d02e169f5b8e072fe9d5152a4960d1bdcee46b9f24",
    "b57eddaee19d50dff58bcfd204f71a25fb784add02ccb6dd67f6f09d412646c5",
    "b5fb431c1d4849e95ca829556f18d21ab41a91c9d18afafdc465574f1864996c",
    "b6c3c6bd02c38c3bc4ab94453b8d7afae9ea150ff79c4ea48f8aab9f1b497f51",
    "babce4a57c33638fee31536541b696ff0781a6be6a0b0198534d5e463bdfe8d3",
    "be901728ab64b41c3f5477ab6862322ddf55468fd50fa844ee6becd9115c37ce",
    "beea3824c6c993a1aabf94b7ecaa6adcf554d7693c620dea86ec2bab680aee8e",
    "bf60e9c9b7b37c7b2b1f0ca439fac4f9f37491f445ec07209b5db39c2d72bd20",
    "bfa2cc754d77b5d3835252dfdd3bdf20b9ee3930eaa23a3d1dc60b0519d18e6c",
    "c02599240e63876284ad94d405b54db5c91e8d60a0cd61d9b6f6069078ff8cd8",
    "c046dcb6f09e6d6286e830e3208bf57c303fbe009b6aa941b23d13e5203f37c5",
    "c0bc1fb752d94d08929425a9bfcadb4fa1eac19b60d32f7b3f1b5309ddd5a5cd",
    "c1b60b2d6007589a654132dc9f7abd64fc2a930a9e74f90fc238864db509b49b",
    "c2949a5da4f2d7396924906f3f83a55f9ad8264153880e2cfd251b4c11847473",
    "c34d39bd4366113852cb438dae55ea8ec1b5d323e809f62604015cc7b13f62cd",
    "c4428ad4fa6ef2f5f5a4bc0ecdf2c064a4ef11d361ddd884c930d854b3c68af8",
    "c5b1cfc906aab45932aa4285d59cd8a03d8c00f77bd9fd6d8f6a328d57193803",
    "c5f9381dcb9d1972ac76fcc9acda2f6bc8c9d388fb863c97f6f76bd2dc518b69",
    "c64f07e118cabd3611c4652039af6aa7b7c93abe11440d6114e75b14218ab3e1",
    "ca38a07eec4669890ddfc1dc4ecdcbfbec14f11cc25260e76530ad45867c367a",
    "cac37615e521b4e0c55c28946000d445742a3c633856ad5a04fc23f4f1dce8d3",
    "cd988cefaee85976b1b953c54ee972ce53031eda2c65909769511569429b07b0",
    "ce39673fc5fabb701239c5ed681c642c3f5ded74e02c1fa205fe564a83c690f3",
    "d07e31cf6e09192ef297d04584f8732bf94224f44c34bf07643576d7a02be689",
    "d08fc7a7c743fad779bd16079e48d7742da8007be9dbc3227eb051dab5b83b17",
    "d14c0368ac012db9469997ffa19018771a7ca69a4a5cc6558d0c0cd60b999c2c",
    "d35a380ad0fb850b33eb11cf755ede11c670071ba8fa46e38a1c0b778107fb7c",
    "d4e31ec17874222c5368ee2c038918086e0022f9030f17b712254f4fd43da23b",
    "d5b00ba9d0ffc853456004aea16cd7df39261c50922fd11f9b5fe9d75a31e43a",
    "d5e24069f8e9c4cdc059dc3caed68c33cfceb6b5a702435eafd9e0ad0ae7c497",
    "d630058520eb86887657806145c3a208183cd0f71964d22b5d18e1d35eae23ad",
    "d6d3e7df79415d96081fa3785c6737c1e595c14427f7d12481ed16251ff24af7",
    "d87392384836e6e940ebc8195befb9c02a74a19a80a699b3f6c2af259bfe7f3a",
    "ddb8d0a6882981d04e6537bbfa808e02e25cec7341e23c391cc829026770a1d4",
    "df358dbf54e7f9d9eb446feba427ca7f54087b4c393b3881f2d4189d7a6399c2",
    "df9ec54bfcadb6f3105c1ed4387099af980ee04d071c0dcda6751f3a4b890d03",
    "e03f7067a4c537965f44d2cd34010ad1f07f9a7b6de04fc052dfa09ed1fb0c3c",
    "e0815df20803731efbac2e31f0345cc96e4eba13a89d47c36732d34cf3391a79",
    "e302f89b5d80c74c08ef35f241b317f07efea5f2f93055e9d9d053955dce51bf",
    "e7132c41bdfbbb0287e746b51cbe06871748eb7b2bfeebd41129f787c50dfc8e",
    "e8f5410225f37d771fc09d587b4936381607a3d9f529fb6d37b939bef23d0f01",
    "e98e2dbcbdc70d1d9a41f24fd565d1c3f102e9d13cdc826952db3174805bc72f",
    "e98f38ae606b3f12c29eaaf6e60df69b75ebd46ce00b7be5b332bbbe203d835d",
    "e9e79e3d113a9e09e03ef26e0275c02682446cc7d3598a6ab65236cf6ccd53d4",
    "ea14e765fab78dd2e207f5f34b657ddd2ebb60e566409b9d89ca7b4882439f4c",
    "ecdfef2041b64faf6082a4098918a6b7383c174c735e5da86398b3d49aa9789a",
    "ef76c8e8df9ce2f988a765ec01c87c9cb4d7e7fc4031fdb046ca668727d896de",
    "f0b8649dbd8cc269a6a9f57166490602cb5e17344007e29c1591f6cdad29aa37",
    "f23c3bb8001b5fa61b5a6b846c488d787b5488eeec73fb957b4eb0260392f27b",
    "f326f7c27b228dc47edaaa7551d7002b95953db948ce3a31ac852d412dc36c20",
    "f918f0b3d517522f9ac5f724725d60f7bffee619575a3a391b6bdd9bf8bb115d",
    "f95772ea63a5f4840b729d1baa13bfb3b4b3f97f40a34026d1dfb88c5767423c",
    "fc7cc3ad2f4501e221f2dc0578c9ea32ef73e69554cdb873e8fce4f221cb98e7",
    "fd17f3d0595b0411e4c1636d8f73af1a66326ebca9a20b49d071069637163586",
    "fe5cda7dcd53a9227015921b3e54b3d9a767b3fd9b0d401ccecdfa2df98cf8f7"
]