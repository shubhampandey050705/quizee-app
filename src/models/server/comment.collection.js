
import { Permission } from "node-appwrite";
import { db, commentCollection } from "../name.js";
import { databases } from "./config.js";

export default async function createCommentColection(){
    //create collection
    await databases.createCollection(db, commentCollection, commentCollection,[
        Permission.read("any"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.create("users"),
        Permission.delete("users")

    ]);
    console.log("Comment collection created")
    //create attributes
    await Promise.all([
        databases.createStringAttribute(db, commentCollection, "content", 10000 , true),
        databases.createEnumAttribute(db, commentCollection, "type",["answer", "question"], true),
        databases.createStringAttribute(db, commentCollection, "typeId",50, true),
        databases.createStringAttribute(db, commentCollection, "auhtorId",50, true),


    ]);
    console.log("Comment collection attributes created");
}