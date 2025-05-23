import { Permission } from "node-appwrite";
import { questionAttachmentBucket } from "../name.js";
import { storage } from "./config.js";

export default async function getOrCreateStorage(){
    try{
        await storage.getBucket(questionAttachmentBucket);
        console.log("storage connected");
    }catch (error){
         try{
            await storage. createBucket(questionAttachmentBucket, questionAttachmentBucket, [
                Permission.create("users"),
                Permission.read("any"),
                Permission.read("users"),
                Permission.update("users"),
                Permission.delete("users"),
             ],
             false,
             undefined,
             undefined,
             ["jpg", "jpeg", "png", "gif", "heic", "webp"]
             );
            console.log("storage created");
            console.log("storage connected");
         }catch(error){
            console.log("storage not created", error);
         }
    }
}