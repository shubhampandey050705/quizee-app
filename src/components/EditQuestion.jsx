'use client';

import { useState } from 'react';
import { databases } from '@/models/server/config';
import { questionCollection, db } from '@/models/name';
import { useRouter } from 'next/navigation';
import { IconEdit } from '@tabler/icons-react';

const EditQuestion = ({ questionId, questionTitle, authorId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(questionTitle);
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    try {
      await databases.updateDocument(db, questionCollection, questionId, {
        title,
        content,
      });

      setIsEditing(false);
      router.refresh(); // refresh current route to show updated data
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  };

  return (
    <div className="mt-4">
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            className="w-full rounded bg-gray-800 p-2 text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Edit title"
          />
          <textarea
            className="w-full rounded bg-gray-800 p-2 text-white"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit content"
          />
          <div className="flex gap-2">
            <button
              className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="rounded bg-gray-600 px-3 py-1 text-white hover:bg-gray-700"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          title="Edit question"
        >
          <IconEdit size={18} />
        </button>
      )}
    </div>
  );
};

export default EditQuestion;
