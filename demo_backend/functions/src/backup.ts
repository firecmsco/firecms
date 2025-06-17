import * as admin from "firebase-admin";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const firestore = require("@google-cloud/firestore");

/**
 * To create a new export:
 * ```
 * gcloud firestore export gs://firecms_firestore_backups --project firecms-demo-27150
 * ```
 */
const bucket = "gs://firecms_firestore_backups/2025-06-17T22:15:50_5871";

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
    console.log("Cleaning up");
    await cleanup();

    console.log("Importing from bucket", bucket);
    return client
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
}

async function cleanup() {
    const firestore = admin.firestore();
    const collections = await firestore.listCollections();
    const collectionsToKeep = ["blog", "products", "users", "crypto", "books", "showcase"];
    await firestore.collection("/blog")
        .get()
        .then((snapshot) =>
            snapshot.docs.forEach(d => {
                if (!blogIds.includes(d.id))
                    d.ref.delete();
            }));
    await firestore.collection("/products")
        .get()
        .then((snapshot) => snapshot.docs.forEach(d => {
            if (!productIds.includes(d.id))
                d.ref.delete();
        }));

    for (const collection of collections) {
        if (!collectionsToKeep.includes(collection.id)) {
            console.log(`Deleting collection ${collection.id} and all its subcollections`);
            await deleteCollection(collection);
        }
    }
}

async function deleteCollection(collectionRef: admin.firestore.CollectionReference) {
    const snapshot = await collectionRef.get();

    const deletionPromises = snapshot.docs.map(async (doc) => {
        // Get all subcollections for this document
        const subcollections = await doc.ref.listCollections();

        // Delete each subcollection recursively
        const subcollectionDeletions = subcollections.map(subcoll =>
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
