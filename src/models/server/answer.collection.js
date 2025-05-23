import {IndexType, Permission} from "node-appwrite"
import {answerCollection,db} from "../name.js"
import {databases} from "./config.js"

export default async function createAnswerCollection(){
    //create collection
    await databases.createCollection(db, answerCollection, answerCollection,[
        Permission.read("any"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.create("users"),
        Permission.delete("users")
    ]);
    console.log("Answer collection created")
    //create attributes
    await Promise.all([
        databases.createStringAttribute(db,answerCollection, "content",10000,true),
        databases.createStringAttribute(db,answerCollection, "questionId",100,true),
        databases.createStringAttribute(db,answerCollection, "authorId",100,true),
         
    ]);
    console.log("Answer collection attributes created");

}