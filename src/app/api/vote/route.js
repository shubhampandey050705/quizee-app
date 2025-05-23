import { databases, users } from '@/models/server/config'; // Importing Appwrite's database and user services
import { NextResponse } from 'next/server'; // For sending responses in Next.js API routes
import { Query, ID } from 'appwrite'; // Appwrite's query utilities and ID generator
import { answerCollection, db, voteCollection, questionCollection } from '@/models/name'; // Your database/collection constants

// The POST function handles incoming POST requests to vote on a question or answer
export async function POST(request) {
  try {
    // Parse the request body to get vote information
    const { voteById, voteStatus, type, typeId } = await request.json();

    // Check if the user has already voted on this item
    const response = await databases.listDocuments(
      db,
      voteCollection,
      [
        Query.equal("type", type),         // Match the type: 'question' or 'answer'
        Query.equal("typeId", typeId),     // Match the ID of the item being voted on
        Query.equal("votedById", voteById) // Match the user who cast the vote
      ]
    );

    const existingVote = response.documents[0]; // Get the first matching vote (if any)

    // If a vote already exists, remove it and adjust reputation
    if (existingVote) {
      // Delete the existing vote
      await databases.deleteDocument(db, voteCollection, existingVote.$id);

      // Fetch the original question or answer to get the author's ID
      const item = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      // Get the author's current reputation
      const authorPrefs = await users.getPrefs(item.authorId);

      // Update author's reputation (down if upvoted before, up if downvoted before)
      await users.updatePrefs(item.authorId, {
        reputation: existingVote.voteStatus === "upvote"
          ? authorPrefs.reputation - 1
          : authorPrefs.reputation + 1
      });
    }

    // If the vote is new or vote status has changed
    if (!existingVote || existingVote.voteStatus !== voteStatus) {
      // Add the new vote to the voteCollection
      await databases.createDocument(
        db,
        voteCollection,
        ID.unique(), // Generate a unique ID for the new vote
        {
          type,
          typeId,
          voteStatus,
          voteById
        }
      );

      // Fetch the updated item again
      const item = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      // Get updated author preferences
      const authorPrefs = await users.getPrefs(item.authorId);

      // If there was a previous vote, reverse its impact on reputation
      if (existingVote) {
        await users.updatePrefs(item.authorId, {
          reputation: existingVote.voteStatus === "upvote"
            ? Number(authorPrefs.reputation) - 1
            : Number(authorPrefs.reputation) + 1
        });
      }
    }

    // Now count the total upvotes and downvotes for the item
    const [upvotes, downvotes] = await Promise.all([
      databases.listDocuments(
        db,
        voteCollection,
        [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "upvote")
        ]
      ),
      databases.listDocuments(
        db,
        voteCollection,
        [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "downvote")
        ]
      )
    ]);

    // Return the updated vote difference as response
    return NextResponse.json({
      data: {
        document: null, // Optional: you could return the vote document if needed
        voteResult: upvotes.total - downvotes.total // Net vote count
      },
      message: "Vote successfully"
    }, {
      status: 200
    });

  } catch (error) {
    // In case of any error, return a 500 or specific error message
    return NextResponse.json({
      message: error.message || "Something went wrong"
    }, {
      status: error?.status || 500
    });
  }
}
