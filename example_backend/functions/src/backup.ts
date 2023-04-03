import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * To create a new export:
 * ```
 * gcloud firestore export gs://firecms_firestore_backups --project firecms-demo-27150
 * ```
 */
const bucket = "gs://firecms_firestore_backups/2023-03-01T19:48:47_26388";

export function eraseDatabase() {
    const firebase_tools = require("firebase-tools");
    console.log("Deleting database");
    const deleteConfig = {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token
    };
    return firebase_tools.firestore
        .delete("/users", deleteConfig)
        .then(() => firebase_tools.firestore
            .delete("/products", deleteConfig))
        .then(() => firebase_tools.firestore
            .delete("/blog", deleteConfig))
        .then(() => {
            console.log("Database erased");
            return Promise.resolve();
        })
        .catch((err: any) => {
            console.error("error erasing db", err);
        });
}

export function importDatabaseBackup() {
    const firestore = require("@google-cloud/firestore");
    const client = new firestore.v1.FirestoreAdminClient();

    console.log("Restoring backup database");
    const databaseName = client.databasePath(
        process.env.GCLOUD_PROJECT,
        "(default)"
    );
    console.log("Cleaning up");
    cleanup().then();

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
    await firestore.collection("/blog")
        .where("status", "==", "draft")
        .get()
        .then((snapshot) =>
            snapshot.docs.forEach(d => d.ref.delete()));
    await firestore.collection("/users")
        .where("__name__", ">", "B07VS1NQYC")
        .get()
        .then((snapshot) => snapshot.docs.forEach(d => d.ref.delete()));
    // await firestore.collection("/books")
    //     .get()
    //     .then((snapshot) => snapshot.docs.forEach(d => {
    //         if (!bookIds.includes(d.id))
    //             return d.ref.delete();
    //         return Promise.resolve();
    //     }));

}

// const bookIds = ["1IyoAlXhx4vg6toXU5nG", "1tVBKKuHgDYo4aI3kP6V", "297XrZBN2cu9SmwvHeau", "2aLCkk9gDkTIYc6Bcdnz", "2w5veXKjiMoB5nrO0vW9", "3f8sbTA8sJb6ZYN8A4hs", "478BXQ9rmGyKtSwO4Ec4", "4D8v8GPRFrwR2AFUN0aY", "4K95UWRDTuwQWfjrOPhB", "4abuVrnhtP9ZjQRnKNfg", "4ewX3ZUkSlCv0YBrbrF5", "4qkn0OzqIbWhkFCAj794", "50n7hB2uc6Xvxub9QkGO", "5LZH3aA1NX8VF2yF6YLk", "5epL2Cszu8QDAE40ZZfu", "5gOTnn96P4y3EI2Af0hC", "6IZxdYu2ttsRKCepEMCI", "6KwsIYqfVkSS6K31T8D0", "6aNNUPm4WupZTh1Spke3", "6bkuZQkMhtYvwqTeQdAZ", "6l1mYEKQBLOZVEV3gaPX", "6w6t10gBsjkqoH0BOu7t", "6xTlLSEIQ1ffTQu1rZcL", "75mmM0gTr0DgOuK3Vkbv", "7CBURrokmzY9jQqDtKm3", "7J91o7s92Befx1LBIRkc", "7bAoQQGHvI1IjeWJ3WEo", "7eV3EunZ5SUYJOlIkpfX", "7jRQOaqzHnN948wMm9Jc", "7keoHb5XiWTu7cifBuXa", "7tN9HBNqwjTVbdWZkNY3", "7zIjf4dkzfysVKCGBYE1", "7zsyVdO3i0bnyFaMtocT", "82fiCeEXWGKlc5Ayg7YR", "8OP6JpMqpmOgJXf067tN", "8VV26WWdkemomPgCwauK", "8hxelZ4gwlFaY2Qsf7TW", "8iwRhCw5i2BnLRMGf1KW", "8rNr1JiQ6JpwRB8SBAgT", "8zeNcb1DmezncB1MQ5r8", "9DItobudmGuPo7QUD62N", "9DUqnmlgsfPMSlP8VUxi", "9IyKdVqwLeTQfemNYDpD", "9aPv2EdGCCf9uqaU99Le", "9k0yHEfUGIcVQOHr2SeG", "AA4yscRVhuZf2yAeDMEr", "ANWySjtfrUKcOMSUYdBt", "AWeQXU5LAE1xcidX7FTX", "AeKrR4txHkMne2iEyASe", "B2AVhQROf1LMi8Gs4WZg", "B5CW976QjS909T553kw0", "BC60OzeRBFiL4enQBxUV", "BOmSFsEiYLd81T2ro6dw", "Bo3gebFeE5pUAZssN3Ge", "Bs8MtLkPaAdiAV07pPSK", "CFyKgwSVRkE4gPa9a5zK", "CFyWp36yClXAPYvoKlcT", "CNeBDsONHnpWm9hrursZ", "CXtX9csD7f0LEBSzjKm1", "CblA8qy1hS3uzt7DUz5c", "CeE49baKiDqmGVx3MAuV", "DZmNlmwVV2btZopcqzzR", "DaoVPi5ARG0UaIEMNngL", "Dicm3wXMWMgyRsItgL2t", "E7wZzzEYaF5ZH0jVdW5i", "ECLOvNWGsXXyJU2B9KWR", "ENaXYmVGzeVkmvYBIob4", "EVCdL1f4glHzsXoh7WcG", "EjYtoq5qmmZ5XnAMbWAA", "EvwIH9H73VFquVRsv0hi", "F3gznQxXkJG2rwmcCtoj", "F6qrYaVuh7geoM273PK2", "FJix4xnwHh6vIHGD58s6", "Ffu5L1PjAt7PXwEbWvti", "G8YED58Jxp262zQu9wC6", "GHu1xMv4DlVyxeCywwZX", "GMcfo617yrc79Fx3WEfm", "GS3oc62rc3kYrMpa6S0O", "H4inaqx77lb2Zyej4dP4", "HEnxI3VSVvEbOjEogVrr", "HQ8eFI8ceWHakWUz3Ap5", "HhCXWBQpRjgh6CQbX7hi", "Hle429y9pkc6ZJevz09w", "Hu7EpK2lbqisp9tt4oWX", "HvVyi5qMGwtQmUYxkBQB", "IKkjaLDNv1CbeQtoe5xv", "JD8qog08ujjlVLG1F5ZX", "JIcUa13BGPPn54EZhHWW", "JNKh06W0EkrFPaT5Fjsz", "JOtso9W1bD7qIpH8kCxo", "JPrjtsyY3QjBled1M6Fz", "JdGeembzJPsNGa9emEmT", "JdgeNOXq6p3JyglYDyxr", "Jlfsrt6zNypkOk2zREld", "JmnXjexsj5jg44G1wnkg", "Jowfj0ZK1LoktmPVh8zz", "K3LlQRAGXhHdVvD21Ah6", "K4uGFDeJsTDdtLt49bNm", "KJplFw5obNagEfUYN80Y", "Kj52GOBLh9XixD47x5Lk", "L2MZiz1NjXBdq8rYmZNO", "LIkV69WlJwZy8RZy0y5U", "LPfZ3wbq2jz8flVshxR4", "LjBZhVv7bj3YVJV9LohR", "M4TZucK4eBw4tXmFioyY", "M52NBKJNE3xmePvhmrp4", "M5Lml6Qc2COMP5pDbnUi", "M6oivIHVqwd1OQ5BwkAl", "MIjAgpuPomVrbz3H6wXh", "MIrMwNY3nAxsMcujhiSA", "MUsEffKoobfnbHJkkEau", "MsQAprEFesNXfEhkpm0F", "NDCcGIKop2ZKf2aXtQ3e", "NHJXtJGq7jGF7jYUCQVv", "NTDrrlk76Zqm8FR0O871", "NsoFwjSbjHOqPc2cK4O2", "O3UPJjxWFlk9eUYnGujw", "OCreuhlHOh9Y1ypQBMPI", "OGIWnIbYALuQDL9UUVrk", "OHdQGElmNVGUkeH6ATqj", "P9UbM0EdQnGgAEZDTPld", "PIzujejjquCxdead9LD3", "PWvGkLIFjJDDetGcHxao", "PbiQfayNgiNoFUCl0MIo", "Pbxld0tdYO2xPrSIz21u", "PscQVE79a9ColwzsQsBn", "Q0xV9ylddXeGWZeHdJLq", "Q1LI3qnM7UyTm911UO5M", "Q7W1ZJaGjxZgGhcm00mk", "QEdgYP1TpmBNNZEInzyB", "QQtAVu0CdnNt6U9F2167", "QYm7sCuczCOqlDO5INi5", "QqsbVGTDOBJIJ1Ge9JLU", "QqwXSazDUbQQzdJaZFN1", "R5NTsbwkxbF1ZcDm9xcK", "RJQVRudn0uKWd1EX385q", "ROTB40iBmgOQwbzoYYDg", "RS4Zr8jk3FCzrKsF5XVW", "RWnNx3uu6UEpGC12NR1Q", "RYhGM4mnhFoEHwS0Cdn6", "SRQ1diCfjcw9G7fUqBcB", "SRzND0tnGzyqlbu0FHRS", "ShkUvm6xf1nsTMqgiB0f", "SjAxMLQsn8gtjIXJUfCU", "SsEC1A3cO8Yy6hpHYYnM", "TPYImrxKdT7EmU5Uogkq", "TQPTgUxew5DK91Nhc7KL", "U4K3xL9ycf5AlBJ3KWYG", "UBbYhPMhfWclrVAOPWdL", "UihrTKMiEGdomRPfaUAD", "UqYnThLDWYLnDUYRiTBQ", "V3ucmIjKshu0o9rfWVVJ", "VXIUB3kWin0RFVWUQIvg", "VwC3gXASCDuR8Y3MX61y", "W1AhMYNIxgpjVrRYVUBg", "Wh7P6oIuWWcGZnAeSLGC", "X5yoXrPhleDFeCMxopYB", "Xp3bCgLWOdl1no1IJnuf", "XzieeSGTStPIiOcpm1XW", "YDUbtod7yjGE3J0pe0Rc", "YJTrIFeblKZcPuS1kDVh", "YMd9Y47D9cZ9NccyzMJq", "YQ3IBOndg2qKmeHW0gMM", "YaiuR058qMaEBa3t702c", "YscjOq74MSEADDU3mrOM", "ZAI86HLUj87Gt5l8862I", "ZXXllpCBPz4eZSLsahSn", "ZZI45jM3Owq1ElohxOBc", "ZfmOlBYAfMybEWPJ78LP", "Zr8E5KPP6ZarrIQnXlmL", "a0yaNvu7L3G0q3ffQppZ", "aNyswkCBPzDa2xnuOxtq", "acywFxhELIR8XvFmnzcb", "aeMdJ1FCNEKmI7vLPluT", "b030WADksmPUqcEKYcbn", "bAPr6AbczmHEzyYXjvvp", "bDEnMigUwufqdMAMM8zf", "bFXFID937FtCsmxNcdqY", "bIYc16jBHMvUCGSZbfDl", "bQHJkPOLyn3funlkQb6p", "bZTuAkWnRvKXfwmH0pIQ", "beH3NyxChVcfqGp6hARH", "cBlFeSAFGJDlEkmOnhU4", "cEd2V3cDpTHsv1V7IzIa", "cTZN00B1z2W42J6zjEBx", "cdkJMzjx3ZdqrnKfDTL3", "d8pFdXEJ9QpKMuPqRCbe", "dQpnMVFE3SpcSg671Pnb", "dohvJnf1cgLemGPuyz25", "e0SyrbVyXTxbk9S0Lp6r", "eEswkA0XydXO2lpRHNWZ", "ePSGf0oDKEPInyEJQ95P", "eSGHxHWNJmAR0bOPyFLg", "eaRrdZVsp1VovkjRUQkX", "eiAtTtXI9PJHLfHBhX9N", "fOQ2uA36pSRfkOLWAAIx", "fd7yTjI10EvRBWUhtztp", "fie6gAPSPKv7h25udgs4", "fsVHCugEFcELM36rz8zf", "gBqoAfABxLz8hRWEIYe0", "grjYmu28lhlHpsPSDJ8M", "h5wRdBlcqDgxjx5hwtbg", "hDtjnjLw3P8OmRYAVp0Z", "hMOocJvZYXrlHKcmyO5A", "hlaw9jNVSrf4bV0kBuD2", "hw60N0UVGNn6h0b3Owv1", "hxF7OkZL3Zp5cneJEgWM", "hzGcqvwLj5NemPoTEtrP", "iSoOqc0wSJTH3jKGlG9K", "igB2oIFONObgxZFeODXO", "jBIIJJvB1Qq7hkinKEuP", "jNGK6fD7jbclxoGRbiuj", "jY2CzUXYfsdv7Tf5B6IM", "jhdnLJ0RXvIxQld0nfEr", "k1xz7aToEcRYeR6SBi8V", "k5cKz2gP6QT5lHUSWL9E", "k85FTtuoKoRICAm1MRE7", "kWsGl7ca6DlGAuLICkla", "l24WzHjWcjJdtj4BZyDz", "mm2JB5fxZVz7BNRKZZGc", "n3Mc2f5HyOO3Y3XaiQJF", "nVqss27MKPvfABvKCYsN", "oHKYEMt7DT93XBRSGD6U", "oLizQO06yAAAwJwTmZ2M", "obny6nrUtbTB0iJMwuWM", "ofIUStlYx9L0LRsABSpF", "ovKlxMJN5DzF5Bs8afq4", "ovcjgDG5laKPvfGWZwcF", "ozDcq5SWHL0t8dLAng9M", "pLJYFuhGlvLFYk3jbGwj", "pQuhwcm9jCX6RJLxq0qz", "pYc7rHq4Ma7GA9wiwpxV", "pf1GMuhmdmjTGNagaLbD", "qCCQkZbJuW7cxpSxGWRJ", "qrc0lYvxBrccdbZK5pQy", "r5QQN9VCBVdo0QIeI1qQ", "rGgsVroIEBFB36DzlSDl", "rWA19tkTuvwUylGdNLMH", "rX2nTAgrqFdNyf4SaHFe", "rsLVxKNTTWX6MtpIqvIq", "sAbuxVm1Gw4BHI8E0GBg", "sLomno9bDjyxyRjDfPtG", "sl7DWLFUzNh3jmQw901F", "sxBpWIcyg8JmM1JQ0vcq", "sxEKNPMach2Kuwv011iM", "tCpYhNULt9r473K2beZO", "taiQnr26zrJG5TJDYc8F", "thsRih1ElBYuyBkrB0hJ", "tmT7G1vJbQV8CYUMIcsd", "uOznSuMS5EM9us0GzfEg", "uYxB4VBT919lPTXVFgSI", "uxiiRVk63j3O9kQnam06", "uzV8JvwoAglqKUlqfJeW", "v11mmUzAgJZDZvOG08ut", "v97qCQJgsRGv93qwsQCk", "vG1r8pfJ07vi1vmZfELI", "vP2sydxs2tNMsfmqudzM", "vUnRqCVgmv7r7GRDNSyC", "vXFIfhzcIN9d86LAld7Q", "w2XOVFtz2KQuKRtydL1y", "w3NTaahTzDomeCI0EUu2", "wO1iM9XHYsT4tORhFshH", "wyqi6l0pBh5TBSySksTl", "x8bYXWmkXzXoMNo29mrx", "xLUO2jj73ytYfvynE2nw", "xReuHWYZnlGrhOv1xWJB", "xSTAa1GNApoXiB0YlseC", "xeDrOpAr2r71TVTNFfSm", "xrNlb1udPM6ly984Es0o", "xzv6FuQRyZT64G768gOZ", "yFhOnxE2x1gxGBGJi8BJ", "yPS4c76TtclHDhtSUYSD", "yWIiUCVWiLhkRNXKe8VK", "yXc3hz4aOk9CvsavZAJ5", "yvxBpyG2JdnUot346rBR", "yxz10jPxlz64Q9TT2L9f", "z05F3mdEtraKF44WIIrc", "z3anWNQlHGHRzEtdhvur", "z5s2IKOFubbqD5lErwbj", "zMtHjl5j5wILjiJeBlnj", "zaHvwDqhqxn4uhQXtydq", "zlj9RNUsstruq5eUm8Im"];

