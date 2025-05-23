import React, { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { Query } from "node-appwrite";

const VotesPage = ({ userId, userSlug, initialPage = 1, initialVoteStatus = null }) => {
  const [page, setPage] = useState(Number(initialPage));
  const [voteStatus, setVoteStatus] = useState(initialVoteStatus);
  const [votes, setVotes] = useState({ documents: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVotes() {
      setLoading(true);
      setError(null);

      try {
        const query = [
          Query.equal("votedById", userId),
          Query.orderDesc("$createdAt"),
          Query.offset((page - 1) * 25),
          Query.limit(25),
        ];

        if (voteStatus) query.push(Query.equal("voteStatus", voteStatus));

        const votesData = await databases.listDocuments(db, voteCollection, query);

        const enrichedVotes = await Promise.all(
          votesData.documents.map(async (vote) => {
            if (vote.type === "question") {
              const question = await databases.getDocument(db, questionCollection, vote.typeId, [
                Query.select(["title"]),
              ]);
              return { ...vote, question };
            } else {
              // vote.type === "answer"
              const answer = await databases.getDocument(db, answerCollection, vote.typeId);
              const question = await databases.getDocument(db, questionCollection, answer.questionId, [
                Query.select(["title"]),
              ]);
              return { ...vote, question };
            }
          })
        );

        setVotes({ documents: enrichedVotes, total: votesData.total });
      } catch (err) {
        setError("Failed to load votes.");
      } finally {
        setLoading(false);
      }
    }

    fetchVotes();
  }, [userId, page, voteStatus]);

  if (loading) return <p>Loading votes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="px-4">
      <div className="mb-4 flex justify-between">
        <p>{votes.total} votes</p>
        <ul className="flex gap-1">
          {[
            { label: "All", status: null },
            { label: "Upvotes", status: "upvoted" },
            { label: "Downvotes", status: "downvoted" },
          ].map(({ label, status }) => (
            <li key={label}>
              <Link
                href={`/users/${userId}/${userSlug}/votes${status ? `?voteStatus=${status}` : ""}`}
                className={`block w-full rounded-full px-3 py-0.5 duration-200 ${
                  voteStatus === status ? "bg-white/20" : "hover:bg-white/20"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setVoteStatus(status);
                  setPage(1);
                }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4 max-w-3xl space-y-6">
        {votes.documents.map((vote) => (
          <div
            key={vote.$id}
            className="rounded-xl border border-white/40 p-4 duration-200 hover:bg-white/10"
          >
            <div className="flex">
              <p className="mr-4 shrink-0">{vote.voteStatus}</p>
              <p>
                <Link
                  href={`/questions/${vote.question.$id}/${slugify(vote.question.title)}`}
                  className="text-orange-500 hover:text-orange-600"
                >
                  {vote.question.title}
                </Link>
              </p>
            </div>
            <p className="text-right text-sm">
              {convertDateToRelativeTime(new Date(vote.$createdAt))}
            </p>
          </div>
        ))}
      </div>
      <Pagination total={votes.total} limit={25} onPageChange={setPage} />
    </div>
  );
};

export default VotesPage;
