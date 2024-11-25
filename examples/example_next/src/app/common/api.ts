import { Author, DatabaseRecipe, Ingredient, Intolerance, Recipe, SurveyData, UserRecipe } from "@/app/common/types";
import {
    addDoc,
    collection,
    doc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    getDoc,
    getDocs,
    getFirestore,
    limit as limitClause,
    orderBy,
    query,
    QueryConstraint,
    where
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { firebase } from "@/firebase";

const storage = getStorage(firebase);

export const getRecipes = async ({
                                     limit = 10,
                                     ingredientsFilter,
                                     categoryFilter,
                                     dietFilter,
                                     intolerancesFilter
                                 }: {
    limit?: number;
    ingredientsFilter?: string[],
    categoryFilter?: string,
    dietFilter?: string,
    intolerancesFilter?: string[]
}): Promise<Recipe[]> => {
    console.log("Getting recipes", { limit, ingredientsFilter, categoryFilter, intolerancesFilter });
    const colRef = collection(getFirestore(firebase), "recipes");
    const queryConstraints: QueryConstraint[] = [limitClause(limit)];
    if (ingredientsFilter && ingredientsFilter.length > 0) {
        queryConstraints.push(where("ingredient_slugs", "array-contains-any", ingredientsFilter));
    }
    if (categoryFilter) {
        queryConstraints.push(where("category", "==", categoryFilter));
    }
    if (dietFilter) {
        queryConstraints.push(where("diet", "==", dietFilter));
    }
    if (intolerancesFilter && intolerancesFilter.length > 0) {
        for (const intolerance of intolerancesFilter) {
            queryConstraints.push(where(`intolerances_matrix.${intolerance}`, "in", ["safe", "adaptable"]));
        }
    }
    console.log("Query constraints", queryConstraints);
    const querySnapshot = await getDocs(query(colRef, ...queryConstraints));
    return Promise.all(querySnapshot.docs.map((doc) => convertRecipe(doc.data() as DatabaseRecipe, doc.id)));
};

export const getUserRecipes = async (uid: string): Promise<UserRecipe[]> => {
    const colRef = collection(getFirestore(firebase), "users", uid, "recipes");
    const querySnapshot = await getDocs(query(colRef, orderBy("created_on", "desc")));
    return Promise.all(querySnapshot.docs.map((doc) => convertUserRecipe(doc.data())));
};

export const saveSurveyResult = (data: SurveyData) => {
    // Save survey data to Firestore
    console.log("Survey Data", data);
    const colRef = collection(getFirestore(firebase), "surveys");
    return addDoc(colRef, { ...data, created_on: new Date() });
}

export const getRecipe = async (id: string): Promise<Recipe | null> => {
    console.log("Getting recipe", id);
    const docRef = doc(getFirestore(firebase), "recipes", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
    return convertRecipe({ ...docSnap.data() } as DatabaseRecipe, docSnap.id,);
};


export const getAuthor = async (id: string): Promise<Author | undefined> => {
    console.log("Getting author", id);
    const docRef = doc(getFirestore(firebase), "authors", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return undefined;
    }
    let data = docSnap.data();
    return {
        ...data,
        image: data.image ? await getDownloadURL(ref(storage, data.image)) : undefined,
    } as Author;
}

async function convertUserRecipe(documentData: DocumentData): Promise<UserRecipe> {
    const recipe = await getRecipe(documentData.recipe.id);
    return {
        ...documentData,
        recipe: recipe as Recipe
    } as UserRecipe;
}

export async function convertRecipe(data: DatabaseRecipe, id: string): Promise<Recipe> {

    return {
        id,
        ...data,
        created_on: data.created_on instanceof Date ? data.created_on : (data.created_on as any)?.toDate(),
        author: data.author?.id ? await getAuthor(data.author.id) : undefined,
        imageUrl: data.image ? await getDownloadURL(ref(storage, data.image)) : undefined,
        videoUrl: data.video ? await getDownloadURL(ref(storage, data.video)) : undefined,
        ingredients: await Promise.all(data.ingredients.map(async (section) => ({
            ...section,
            ingredients: await Promise.all(section.ingredients.map(async (ingredientMapping) => ({
                ...ingredientMapping,
                ingredient: await getIngredient(ingredientMapping.ingredient),
            }))),
        }))),

        intolerances: (await Promise.all(data.intolerances.map(async (intolerance) => ({
            ...intolerance,
            intolerance: intolerance.intolerance ? await getIntolerance(intolerance.intolerance) : null,
        })))).filter((intolerance) => intolerance.intolerance !== null) as Recipe["intolerances"],
    };
}


function getIngredient(ingredient: DocumentReference): Promise<Ingredient | null> {
    if (!ingredient.id) {
        return Promise.resolve(null);
    }
    return getDoc(doc(collection(getFirestore(firebase), "ingredients"), ingredient.id)).then((snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Ingredient;
        }
        return null;
    });
}

function getIntolerance(intolerance: DocumentReference): Promise<Intolerance | null> {
    return getDoc(doc(collection(getFirestore(firebase), "intolerances"), intolerance.id)).then((snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Intolerance;
        }
        return null;
    });
}

export function getIngredients(): Promise<Ingredient[]> {
    return getDocs(collection(getFirestore(firebase), "ingredients")).then((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Ingredient));
    });
}

export function getIntolerances(): Promise<Intolerance[]> {
    return getDocs(collection(getFirestore(firebase), "intolerances")).then((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Intolerance));
    });
}
