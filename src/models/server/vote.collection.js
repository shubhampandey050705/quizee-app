import { Permission } from "node-appwrite";
import { db, voteCollection} from "../name.js";
import { databases } from "./config.js";

export default async function createVoteCollection() {
    //create collection
    await databases.createCollection(db,voteCollection,voteCollection,[
        Permission.read("any"),
        Permission.read("users"),
        Permission.update("users"),
        Permission.create("users"),
        Permission.delete("users")
    ]);
    console.log("Vote collection created");
    //create attributes
    await Promise.all([
        databases.createEnumAttribute(db,voteCollection,"type",["question" ,"answer"], true),
        databases.createStringAttribute(db,voteCollection, "typeId", 50,true),
        databases.createEnumAttribute(db,voteCollection, "voteStatus", ["upvoted", "downvoted"], true),
        databases.createStringAttribute(db,voteCollection, "voteById", 50, true),
    ])
    console.log("Vote collection attributes created");

}
