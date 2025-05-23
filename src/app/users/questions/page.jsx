import React, { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";
import QuestionCard from "@/components/QuestionCard";
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query } from "node-appwrite";

const QuestionsPage = ({ userId, userSlug, initialPage = "1" }) => {
  const [page, setPage] = useState(Number(initialPage));
  const [questions, setQuestions] = useState({ documents: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      setError(null);

      try {
        const queries = [
          Query.equal("authorId", userId),
          Query.orderDesc("$createdAt"),
          Query.offset((page - 1) * 25),
          Query.limit(25),
        ];

        const questionsData = await databases.listDocuments(db, questionCollection, queries);

        const questionsWithExtra = await Promise.all(
          questionsData.documents.map(async (ques) => {
            const [author, answers, votes] = await Promise.all([
              users.get<UserPrefs>(ques.authorId),
              databases.listDocuments(db, answerCollection, [
                Query.equal("questionId", ques.$id),
                Query.limit(1),
              ]),
              databases.listDocuments(db, voteCollection, [
                Query.equal("type", "question"),
                Query.equal("typeId", ques.$id),
                Query.limit(1),
              ]),
            ]);

            return {
              ...ques,
              totalAnswers: answers.total,
              totalVotes: votes.total,
              author: {
                $id: author.$id,
                reputation: author.prefs.reputation,
                name: author.name,
              },
            };
          })
        );

        setQuestions({ documents: questionsWithExtra, total: questionsData.total });
      } catch (err) {
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [userId, page]);

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="px-4">
      <div className="mb-4">
        <p>{questions.total} questions</p>
      </div>
      <div className="mb-4 max-w-3xl space-y-6">
        {questions.documents.map((ques) => (
          <QuestionCard key={ques.$id} ques={ques} />
        ))}
      </div>
      <Pagination total={questions.total} limit={25} onPageChange={setPage} />
    </div>
  );
};

export default QuestionsPage;
