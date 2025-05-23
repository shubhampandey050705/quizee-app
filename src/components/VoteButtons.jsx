"use client"; // This tells Next.js to render this component on the client side

import React, { useEffect, useState } from "react";
import { databases } from "@/models/client/config"; // Appwrite client-side database instance
import { db, voteCollection } from "@/models/name"; // Database ID and collection constants
import { useAuthStore } from "@/store/Auth"; // Custom hook to access user authentication state
import { cn } from "@/lib/utils"; // Utility for conditional classNames
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react"; // Icons for voting
import { ID, Query } from "appwrite"; // Appwrite utilities
import { useRouter } from "next/navigation"; // Next.js router for client-side navigation

const VoteButtons = ({ type, id, upvotes, downvotes, className }) => {
  // State to track the user's existing vote on this item
  const [votedDocument, setVotedDocument] = useState(undefined); // undefined = not yet fetched
  const [voteResult, setVoteResult] = useState(upvotes.total - downvotes.total); // Initial net vote count

  const { user } = useAuthStore(); // Get the current authenticated user
  const router = useRouter(); // Router to redirect to login if needed

  // Fetch the user's existing vote (if logged in)
  useEffect(() => {
    (async () => {
      if (user) {
        const response = await databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", id),
          Query.equal("votedById", user.$id),
        ]);
        setVotedDocument(response.documents[0] || null); // Set vote or null
      }
    })();
  }, [user, id, type]);

  // Handle upvote
  const toggleUpvote = async () => {
    if (!user) return router.push("/login"); // Redirect to login if user is not logged in
    if (votedDocument === undefined) return; // Wait until vote status is loaded

    try {
      const response = await fetch(`/api/vote`, {
        method: "POST",
        body: JSON.stringify({
          votedById: user.$id,
          voteStatus: "upvoted",
          type,
          typeId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw data;

      setVoteResult(data.data.voteResult); // Update vote count
      setVotedDocument(data.data.document); // Update local vote status
    } catch (error) {
      window.alert(error?.message || "Something went wrong");
    }
  };

  // Handle downvote
  const toggleDownvote = async () => {
    if (!user) return router.push("/login");
    if (votedDocument === undefined) return;

    try {
      const response = await fetch(`/api/vote`, {
        method: "POST",
        body: JSON.stringify({
          votedById: user.$id,
          voteStatus: "downvoted",
          type,
          typeId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw data;

      setVoteResult(data.data.voteResult);
      setVotedDocument(data.data.document);
    } catch (error) {
      window.alert(error?.message || "Something went wrong");
    }
  };

  return (
    <div className={cn("flex shrink-0 flex-col items-center justify-start gap-y-4", className)}>
      {/* Upvote Button */}
      <button
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
          votedDocument && votedDocument.voteStatus === "upvoted"
            ? "border-orange-500 text-orange-500"
            : "border-white/30"
        )}
        onClick={toggleUpvote}
      >
        <IconCaretUpFilled />
      </button>

      {/* Vote count display */}
      <span>{voteResult}</span>

      {/* Downvote Button */}
      <button
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
          votedDocument && votedDocument.voteStatus === "downvoted"
            ? "border-orange-500 text-orange-500"
            : "border-white/30"
        )}
        onClick={toggleDownvote}
      >
        <IconCaretDownFilled />
      </button>
    </div>
  );
};

export default VoteButtons;
