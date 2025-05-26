"use client";

import { useAuthStore } from "@/zustandStore/Auth";
import { useEffect, useState } from "react";
import { databases } from "@/models/client/config"; // ✅ client-side config
import { db, questionCollection, answerCollection } from "@/models/name";
import { Query } from "appwrite"; // ✅ Not node-appwrite!
import { MagicCard, MagicContainer } from "@/components/magicui/magic-card";
import NumberTicker from "@/components/magicui/number-ticker";

const ProfilePage = () => {
  const { user, hydrated } = useAuthStore();
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Avoid SSR mismatch
    if (typeof window === "undefined" || !hydrated || !user) return;

    async function fetchData() {
      try {
        const [questionsData, answersData] = await Promise.all([
          databases.listDocuments(db, questionCollection, [
            Query.equal("authorId", user.$id),
          ]),
          databases.listDocuments(db, answerCollection, [
            Query.equal("authorId", user.$id),
          ]),
        ]);

        setQuestions(questionsData);
        setAnswers(answersData);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Failed to load profile data");
      }
    }

    fetchData();
  }, [user, hydrated]);

  // SSR-safe early exit
  if (typeof window === "undefined" || !hydrated) return null;

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!user) return <p className="text-center">You are not logged in.</p>;
  if (!questions || !answers) return <p className="text-center">Loading data...</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Welcome, {user.name}
      </h1>

      <MagicContainer className="flex flex-col gap-4 lg:flex-row">
        <MagicCard className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold mb-2">Reputation</h2>
          <NumberTicker value={user.prefs?.reputation || 0} />
        </MagicCard>

        <MagicCard className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold mb-2">Questions Asked</h2>
          <NumberTicker value={questions.total} />
        </MagicCard>

        <MagicCard className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-semibold mb-2">Answers Given</h2>
          <NumberTicker value={answers.total} />
        </MagicCard>
      </MagicContainer>
    </div>
  );
};

export default ProfilePage;
