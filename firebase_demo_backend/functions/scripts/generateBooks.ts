import * as admin from "firebase-admin";
import { initServiceAccountFirestore } from "./util";
const crypto = require('crypto');


initServiceAccountFirestore(true);

const firestore = admin.firestore();

// const categories = new Set<string>();
// const catMap: Record<string, any> = {};


const categories = {
    fiction: "Fiction",
    drama: "Drama",
    "fantasy-fiction": "Fantasy fiction",
    history: "History",
    religion: "Religion",
    "self-help": "Self-Help",
    "comics-graphic-novels": "Comics & Graphic Novels",
    "juvenile-fiction": "Juvenile Fiction",
    philosophy: "Philosophy",
    fantasy: "Fantasy",
    education: "Education",
    science: "Science",
    medical: "Medical",
    cooking: "Cooking",
    travel: "Travel"
};

const generateBooks = async () => {
    const fs = require("fs")
    const csv = require("fast-csv");
    const data: any[] = []

    fs.createReadStream("books.csv")
        .pipe(csv.parse({ headers: true }))
        .on("error", (error: any) => console.error(error))
        .on("data", (row: any) => data.push(row))
        .on("end", () => {
                data.sort((a: any, b: any) => {
                    return parseFloat(b.average_rating) - parseFloat(a.average_rating)
                });
                const books = data
                    .filter(b => parseFloat(b.ratings_count) > 1000)
                    .slice(0, 200)
                    .map((b) => {
                        const catSlugs = b.categories.split(",").map((c: string) => slugify(c.trim()));
                        const cat = catSlugs.find((c: string) => c in categories);
                        let newVar = {
                            isbn13: parseInt(b.isbn13),
                            isbn10: parseInt(b.isbn10),
                            title: b.title,
                            subtitle: b.subtitle,
                            authors: b.authors,
                            thumbnail: b.thumbnail,
                            description: b.description,
                            published_year: parseInt(b.published_year),
                            average_rating: parseFloat(b.average_rating),
                            num_pages: parseInt(b.num_pages),
                            ratings_count: parseInt(b.ratings_count),
                        };
                        if (cat) {
                            // @ts-ignore
                            newVar.category = cat;
                        }
                        return newVar;
                    });

                books.forEach((b: any) => {
                    const hash = crypto.createHash('sha256', "sdfcerfewrf")
                        .update(b.title)
                        .digest('hex');
                    firestore
                        .collection("books")
                        .doc(hash)
                        // .doc(b.isbn13.toString())
                        .set(b);
                });
                console.log(books);
            }
        );


};
generateBooks();

const slugify = function (text?: string) {
    if (!text) return "";
    const from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;"
    const to = "aaaaaeeeeeiiiiooooouuuunc------"

    for (var i = 0, l = from.length; i < l; i++) {
        text = text.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    return text
        .toString()                     // Cast to string
        .toLowerCase()                  // Convert the string to lowercase letters
        .trim()                         // Remove whitespace from both sides of a string
        .replace(/\s+/g, "-")           // Replace spaces with -
        .replace(/&/g, "-")             // Replace & with -
        .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
        .replace(/\-\-+/g, "-")         // Replace multiple - with single -
        .replace(/^\s+|\s+$/g, "");
}
