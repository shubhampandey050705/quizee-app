import React, { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import { MarkdownPreview } from "@/components/RTE";
import { answerCollection, db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { Query } from "node-appwrite";

const AnswersPage = ({ userId, userSlug, initialPage = "1" }) => {
  const [page, setPage] = useState(Number(initialPage));
  const [answers, setAnswers] = useState({ documents: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnswers() {
      setLoading(true);
      setError(null);

      try {
        const queries = [
          Query.equal("authorId", userId),
          Query.orderDesc("$createdAt"),
          Query.offset((page - 1) * 25),
          Query.limit(25),
        ];

        const answersData = await databases.listDocuments(db, answerCollection, queries);

        const answersWithQuestions = await Promise.all(
          answersData.documents.map(async (ans) => {
            const question = await databases.getDocument(db, questionCollection, ans.questionId, [
              Query.select(["title"]),
            ]);
            return { ...ans, question };
          })
        );

        setAnswers({ documents: answersWithQuestions, total: answersData.total });
      } catch (err) {
        setError("Failed to load answers.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnswers();
  }, [userId, page]);

  if (loading) return <p>Loading answers...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="px-4">
      <div className="mb-4">
        <p>{answers.total} answers</p>
      </div>
      <div className="mb-4 max-w-3xl space-y-6">
        {answers.documents.map((ans) => (
          <div key={ans.$id}>
            <div className="max-h-40 overflow-auto">
              <MarkdownPreview source={ans.content} className="rounded-lg p-4" />
            </div>
            <Link
              href={`/questions/${ans.questionId}/${slugify(ans.question.title)}`}
              className="mt-3 inline-block shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
            >
              Question
            </Link>
          </div>
        ))}
      </div>
      <Pagination total={answers.total} limit={25} />
    </div>
  );
};

export default AnswersPage;
