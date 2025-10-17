import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.bitejoy.foodordering",
    databaseId: '68ede4ef0010522d5485',
    bucketId: '68ef7576000ca2b3822e',
    userCollectionId: 'user',
    categoryCollectionId: 'categories',
    menuCollectionId: 'menu',
    customizationsCollectionId: 'cutomizations',
    menucustomizationCollectionId: 'menu_customizations',
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

const avatars = new Avatars(client);

export const createUser = async ({email, password, name}: CreateUserParams) => {
    try {
        console.log('Creating user account with email:', email);
        console.log('Appwrite config:', {
            endpoint: appwriteConfig.endpoint,
            projectId: appwriteConfig.projectId,
            databaseId: appwriteConfig.databaseId
        });

        const newAccount = await account.create(ID.unique(), email, password, name);
        if(!newAccount) throw new Error('Failed to create account');

        console.log('Account created successfully, user is already signed in');

        const avatarUrl = avatars.getInitialsURL(name);
        console.log('Creating user document in database...');

        const userDocument = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                email,
                name,
                accountid: newAccount.$id,
                avatar: avatarUrl
            }
        );
        
        console.log('User document created successfully:', userDocument);
        return userDocument;
    } catch (e: any) {
        console.error('Error creating user:', e);
        throw new Error(e?.message || 'Failed to create user');
    }
}

export const signIn = async ({email, password}: SignInParams) => {
    try {
        console.log('Signing in user...');
        
        // Check if user is already signed in
        try {
            const currentSession = await account.get();
            if (currentSession) {
                console.log('User is already signed in');
                return currentSession;
            }
        } catch (e) {
            // No current session, proceed with sign in
        }
        
        const session = await account.createEmailPasswordSession(email, password);
        console.log('User signed in successfully');
        return session;
    } catch (e: any) {
        console.error('Error signing in:', e);
        
        if (e.message.includes('session is active')) {
            throw new Error('You are already signed in. Please sign out first if you want to sign in with a different account.');
        }
        
        throw new Error(e?.message || 'Failed to sign in');
    }
}

export const signOut = async () => {
    try {
        console.log('Signing out user...');
        await account.deleteSession('current');
        console.log('User signed out successfully');
    } catch (e: any) {
        console.error('Error signing out:', e);
        // Don't throw error for sign out, just log it
    }
}

export const getCurrentUser = async () => {
    try {
        const user = await account.get();
        return user;
    } catch (e: any) {
        console.log('No current user session');
        return null;
    }
}

export const getMenu = async ({ category, query, limit }: GetMenuParams) => {
    try {
        console.log('getMenu called with:', { category, query, limit });
        const queries: string[] = [];

        if(category) queries.push(Query.equal('categories', category));
        if(query) queries.push(Query.search('name', query));
        if(limit) {
            console.log('Adding limit query:', limit);
            queries.push(Query.limit(limit));
        }

        console.log('Final queries:', queries);
        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )

        console.log('Returning', menus.documents.length, 'menu items');
        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}
export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoryCollectionId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}