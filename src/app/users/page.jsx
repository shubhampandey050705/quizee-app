"use client";

import React, { useEffect, useState } from "react";
import { databases, users } from "@/models/server/config";
import { MagicCard, MagicContainer } from "@/components/magicui/magic-card";
import NumberTicker from "@/components/magicui/number-ticker";
import { answerCollection, db, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";

const Page = ({ params }) => {
  const { userId } = params;
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userData, questionsData, answersData] = await Promise.all([
          users.get(userId),
          databases.listDocuments(db, questionCollection, [
            Query.equal("authorId", userId),
            Query.limit(1),
          ]),
          databases.listDocuments(db, answerCollection, [
            Query.equal("authorId", userId),
            Query.limit(1),
          ]),
        ]);
        setUser(userData);
        setQuestions(questionsData);
        setAnswers(answersData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!user || !questions || !answers) return <p>No data found.</p>;

  return (
    <MagicContainer className="flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row">
      <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
        <div className="absolute inset-x-4 top-4">
          <h2 className="text-xl font-medium">Reputation</h2>
        </div>
        <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
          <NumberTicker value={user.prefs.reputation} />
        </p>
        <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </MagicCard>
      <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
        <div className="absolute inset-x-4 top-4">
          <h2 className="text-xl font-medium">Questions asked</h2>
        </div>
        <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
          <NumberTicker value={questions.total} />
        </p>
        <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </MagicCard>
      <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
        <div className="absolute inset-x-4 top-4">
          <h2 className="text-xl font-medium">Answers given</h2>
        </div>
        <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
          <NumberTicker value={answers.total} />
        </p>
        <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </MagicCard>
    </MagicContainer>
  );
};

export default Page;
