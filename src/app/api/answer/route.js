import { NextRequest, NextResponse } from "next/server";
import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { ID } from "node-appwrite";

export async function POST(request) {
  try {
    const { questionId, answer, authorId } = await request.json();

    if (!questionId || !answer || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await answerCollection.createDocument(
      db,
      answerCollection,
      ID.unique(),
      {
        questionId,
        answer,
        authorId,
      }
    );

    // Increase author reputation
    const prefs = await users.getPrefs(authorId);

    await users.updatePrefs(authorId, {
      reputation: Number(prefs.reputation || 0) + 1,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.message || "Something went wrong",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
}

export async function DELETE(request) {
  try {
    const { answerId } = await request.json();

    if (!answerId) {
      return NextResponse.json(
        { error: "Answer ID is required" },
        { status: 400 }
      );
    }

    const answer = await databases.getDocument(db, answerCollection, answerId);

    const response = await databases.deleteDocument(
      db,
      answerCollection,
      answerId
    );

    const prefs = await users.getPrefs(answer.authorId);

    await users.updatePrefs(answer.authorId, {
      reputation: Number(prefs.reputation || 0) - 1,
    });

    return NextResponse.json(
      { message: "Answer deleted", data: response },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.message || "Something went wrong",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
}
