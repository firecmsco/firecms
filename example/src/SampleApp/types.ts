import firebase from "firebase";
import firestore = firebase.firestore;

export type Product = {
    name: string;
    main_image: string;
    category:string;
    available: boolean;
    price: number;
    currency: string;
    public: boolean;
    brand: string;
    description: string;
    amazon_link: string;
    images: string[];
    related_products: firestore.DocumentReference[];
    publisher: {
        name: string;

    },
    available_locales: string[],
    uppercase_name: string,
    added_on: firestore.Timestamp;
}


export type Locale = {
    name: string,
    description: string,
    selectable?: boolean,
    video: string
}
