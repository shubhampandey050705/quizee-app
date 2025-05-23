
import { env } from "@/app/env.js"; // Adjust the path as needed
import { Client, Databases, Users, Storage, Avatars } from "node-appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(env.appwrite.endpoint)     // e.g. https://cloud.appwrite.io/v1
  .setProject(env.appwrite.projectId)     // Your Appwrite Project ID
  .setKey(env.appwrite.apikey);           // Server API key (use only on server)

// Initialize Appwrite services
const databases = new Databases(client);
const users = new Users(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

// Export configured services
export { client, databases, users, storage, avatars };
