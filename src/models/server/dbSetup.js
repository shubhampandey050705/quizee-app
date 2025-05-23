import { db } from "../name.js";
import createAnswerCollection from "./answer.collection.js";
import createQuestionCollection from "./question.collection.js";
import createVoteCollection from "./vote.collection.js";
import createCommentCollection from "./comment.collection.js";
import { databases } from "./config.js";

export default async function getOrCreateDB() {
  try {
    // Try to get the existing database
    await databases.get(db);
    console.log("Database connected");
  } catch (error) {
    // Database does not exist, create it and collections
    try {
      await databases.create(db, db);
      console.log("Database created");

      await Promise.all([
        createAnswerCollection(),
        createQuestionCollection(),
        createVoteCollection(),
        createCommentCollection(),
      ]);

      console.log("Collections created");
      console.log("Database connected");
    } catch (innerError) {
      console.error("Failed to create database or collections:", innerError);
      throw innerError; // Rethrow so caller knows connection failed
    }
  }
  return databases;
}
