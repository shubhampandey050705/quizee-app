import { env } from "@/app/env.js";
import { Client, Account, Avatars, Databases, Storage } from "appwrite";

if (!env.appwrite.endpoint || !env.appwrite.projectId) {
  throw new Error("Appwrite endpoint or projectId is not defined in environment variables");
}

const client = new Client()
  .setEndpoint(env.appwrite.endpoint)
  .setProject(env.appwrite.projectId);

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export { client, databases, account, storage, avatars };
