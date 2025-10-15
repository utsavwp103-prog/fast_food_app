import { CreateUserParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.bitejoy.foodordering",
    databaseId: '68ede4ef0010522d5485',
    userCollectionId: 'user',
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

export const createUser = async ({email, password, name}: CreateUserParams) => {
    try {
        console.log('Creating user account with email:', email);
        console.log('Appwrite config:', {
            endpoint: appwriteConfig.endpoint,
            projectId: appwriteConfig.projectId,
            databaseId: appwriteConfig.databaseId
        });
        
        // Sign out any existing session before creating new user
        // console.log('Checking for existing session...');
        // try {
        //     await signOut();
        // } catch (e) {
        //     console.log('No existing session to clear');
        // }
        
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