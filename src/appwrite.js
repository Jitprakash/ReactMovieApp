import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

//Create a new appwrite Client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

//Define the Functionalities to be used from client
const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    //1. Use AppWrite SDK to check if the search term exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('searchTerm', searchTerm)]);

        //2. If it does, Update the count 
        if (result.documents.length > 0) {

            //get the document
            const doc = result.documents[0];
            //Update the count
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            });
        } else {
            //3. If it doesn't , Create a new document with the search term and count as 1
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error(error);

    }


}

export const getTrendingMovies = async () => {
    try {
        const result = database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count"),
        ]);

        return (await result).documents;
    } catch (error) {
        console.error(error);
    }
}