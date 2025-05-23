import {Permission , Role} from "node-appwrite"

import {db, questionCollection} from "../name.js"
import {databases} from "./config.js"

export default async function createQuestionCollection(){
    //create collection
    await databases.createCollection(db , questionCollection, questionCollection,[
    Permission.read(Role.any()),
    Permission.read(Role.users()),
    Permission.update(Role.users()),
    Permission.create(Role.users()),
    Permission.delete(Role.users())

    ])

    console.log("Question collection created")

    //create attributes
    await Promise.all([
        databases.createStringAttribute(db, questionCollection, "title", 100,true),
        databases.createStringAttribute(db, questionCollection, "content", 10000,true),        
        databases.createStringAttribute(db, questionCollection, "authorId", 50,true),        
        databases.createStringAttribute(db, questionCollection, "tags", 50,true,undefined,true),        
        databases.createStringAttribute(db, questionCollection, "attachmentId", 50,false),        

    ])
    console.log("Question collection attributes created");

    // //create indexes // we created this manually on appwrite console
    // await Promise.all([
    //     databases.createIndex(db,questionCollection, "title", IndexType.fulltext,["title"],["asc"]),
    //     databases.createIndex(db,questionCollection, "content", IndexType.fulltext,["content"],["asc"])
    // ])
}