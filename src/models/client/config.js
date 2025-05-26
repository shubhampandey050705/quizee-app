// @/models/client/config.js
import { Client, Account, Avatars, Databases, Storage } from "appwrite";
import { env } from "@/app/env.js"; // ✅ Make sure `env` is accessible client-side

// 🚨 Ensure this runs only in the browser
if (typeof window !== "undefined") {
  if (!env.appwrite.endpoint || !env.appwrite.projectId) {
    throw new Error("Appwrite endpoint or projectId is not defined in environment variables");
  }
}

const client = new Client();

if (typeof window !== "undefined") {
  client
    .setEndpoint(env.appwrite.endpoint)
    .setProject(env.appwrite.projectId);
}

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export { client, account, databases, storage, avatars };
