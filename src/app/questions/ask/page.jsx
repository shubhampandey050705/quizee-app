"use client";

import RTE from "@/components/RTE";
import Meteors from "@/components/magicui/meteors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/zustandStore/Auth";
import { cn } from "@/lib/utils";
import slugify from "@/utils/slugify";
import { IconX } from "@tabler/icons-react";
import { ID } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";
import { databases, storage } from "@/models/client/config";
import {
  db,
  questionAttachmentBucket,
  questionCollection,
} from "@/models/name";
import { Confetti } from "@/components/magicui/confetti";

// Wrapper for consistent field styling
const LabelInputContainer = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col space-y-2 overflow-hidden rounded-xl border border-white/20 bg-slate-950 p-4",
        className
      )}
    >
      <Meteors number={30} />
      {children}
    </div>
  );
};

const QuestionForm = ({ question }) => {
  const { user } = useAuthStore();
  const router = useRouter();

  // State for form inputs
  const [formData, setFormData] = React.useState({
    title: question?.title || "",
    content: question?.content || "",
    authorId: user?.$id,
    tags: question?.tags || [],
    attachment: null,
  });

  const [tag, setTag] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Confetti animation function
  const loadConfetti = (timeInMS = 3000) => {
    const end = Date.now() + timeInMS;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      Confetti({ particleCount: 2, angle: 60, spread: 55, startVelocity: 60, origin: { x: 0, y: 0.5 }, colors });
      Confetti({ particleCount: 2, angle: 120, spread: 55, startVelocity: 60, origin: { x: 1, y: 0.5 }, colors });

      requestAnimationFrame(frame);
    };

    frame();
  };

  // Create new question
  const create = async () => {
    if (!formData.attachment) throw new Error("Please upload an image");

    const file = await storage.createFile(
      questionAttachmentBucket,
      ID.unique(),
      formData.attachment
    );

    const doc = await databases.createDocument(
      db,
      questionCollection,
      ID.unique(),
      {
        title: formData.title,
        content: formData.content,
        authorId: formData.authorId,
        tags: formData.tags,
        attachmentId: file.$id,
      }
    );

    loadConfetti();
    return doc;
  };

  // Update existing question
  const update = async () => {
    if (!question) throw new Error("Question not found");

    let attachmentId = question.attachmentId;

    if (formData.attachment) {
      await storage.deleteFile(questionAttachmentBucket, question.attachmentId);
      const file = await storage.createFile(
        questionAttachmentBucket,
        ID.unique(),
        formData.attachment
      );
      attachmentId = file.$id;
    }

    const doc = await databases.updateDocument(
      db,
      questionCollection,
      question.$id,
      {
        title: formData.title,
        content: formData.content,
        authorId: formData.authorId,
        tags: formData.tags,
        attachmentId,
      }
    );

    return doc;
  };

  // Handle form submission
  const submit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.authorId) {
      setError("Please fill out all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const doc = question ? await update() : await create();
      router.push(`/questions/${doc.$id}/${slugify(formData.title)}`);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      {error && (
        <LabelInputContainer>
          <div className="text-center text-red-500">{error}</div>
        </LabelInputContainer>
      )}

      {/* Title input */}
      <LabelInputContainer>
        <Label htmlFor="title">
          Title Address
          <br />
          <small>Be specific and imagine you're asking another person.</small>
        </Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. How to find index in a vector in R?"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </LabelInputContainer>

      {/* Content editor */}
      <LabelInputContainer>
        <Label htmlFor="content">
          What are the details of your problem?
          <br />
          <small>Introduce the problem and give more context.</small>
        </Label>
        <RTE
          value={formData.content}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, content: val || "" }))
          }
        />
      </LabelInputContainer>

      {/* Image upload */}
      <LabelInputContainer>
        <Label htmlFor="image">
          Image (optional)
          <br />
          <small>Add a visual to explain your problem clearly.</small>
        </Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFormData((prev) => ({ ...prev, attachment: file }));
            }
          }}
        />
      </LabelInputContainer>

      {/* Tags input */}
      <LabelInputContainer>
        <Label htmlFor="tag">
          Tags
          <br />
          <small>Add tags to describe your question topic.</small>
        </Label>
        <div className="flex w-full gap-4">
          <Input
            id="tag"
            name="tag"
            type="text"
            placeholder="e.g. java, react"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <button
            type="button"
            className="rounded-full border border-slate-600 bg-slate-700 px-8 py-2 text-sm text-white hover:shadow-2xl"
            onClick={() => {
              if (tag && !formData.tags.includes(tag)) {
                setFormData((prev) => ({
                  ...prev,
                  tags: [...prev.tags, tag],
                }));
              }
              setTag("");
            }}
          >
            Add
          </button>
        </div>

        {/* Display tags */}
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tagItem, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="bg-zinc-800 rounded-full px-4 py-1 text-white text-xs flex items-center space-x-2">
                <span>{tagItem}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: prev.tags.filter((t) => t !== tagItem),
                    }))
                  }
                >
                  <IconX size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </LabelInputContainer>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-md border border-slate-800 bg-gradient-to-r from-black via-slate-900 to-black px-6 text-slate-400 hover:text-white"
      >
        {question ? "Update" : "Publish"}
      </button>
    </form>
  );
};

export default QuestionForm;
