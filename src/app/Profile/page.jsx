"use client";

import { useAuthStore } from "@/zustandStore/Auth";
import { useEffect, useState } from "react";
import { databases } from "@/models/client/config";
import { db, questionCollection, answerCollection } from "@/models/name";
import { Query } from "appwrite";
import { MagicCard, MagicContainer } from "@/components/magicui/magic-card";
import NumberTicker from "@/components/magicui/number-ticker";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const ProfilePage = () => {
  const { user, hydrated } = useAuthStore();
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  if (typeof window === "undefined" || !hydrated) return null;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!user) return <p className="text-center">You are not logged in.</p>;
  if (!questions || !answers) return <p className="text-center">Loading data...</p>;

  const profilePicture = user.prefs?.profilePicture || null;

  return (
    <div className="p-6  mx-auto text-white bg-black">
      {/* Gradient Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Welcome, {user.name}
        </h1>
        <p className="text-lg text-white-700">This is your developer profile</p>
      </div>

      {/* Profile Info */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl text-center mb-10">
        <div className="flex flex-col items-center">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile"
              width={120}
              height={120}
              className="rounded-full object-cover border-4 border-black shadow-md"
            />
          ) : (
            <UserCircleIcon className="w-28 h-28 text-gray-400" />
          )}
          <p className="mt-4 text-xl font-semibold">{user.name}</p>
          <p className="text-sm text-black-600">{user.email}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <MagicContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MagicCard className="bg-gradient-to-r from-green-200 to-blue-200 p-6 rounded-xl text-center shadow-lg transform transition-transform hover:scale-105 text-black">
          <h2 className="text-xl font-bold mb-2">Reputation</h2>
          <NumberTicker value={user.prefs?.reputation || 0} />
        </MagicCard>

        <MagicCard className="bg-gradient-to-r from-pink-200 to-yellow-200 p-6 rounded-xl text-center shadow-lg transform transition-transform hover:scale-105 text-black">
          <h2 className="text-xl font-bold mb-2">Questions Asked</h2>
          <NumberTicker value={questions.total} />
        </MagicCard>

        <MagicCard className="bg-gradient-to-r from-indigo-200 to-purple-200 p-6 rounded-xl text-center shadow-lg transform transition-transform hover:scale-105 text-black">
          <h2 className="text-xl font-bold mb-2">Answers Given</h2>
          <NumberTicker value={answers.total} />
        </MagicCard>
      </MagicContainer>
    </div>
  );
};

export default ProfilePage;
