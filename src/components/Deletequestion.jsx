'use client';

import { useRouter } from 'next/navigation';
import { databases } from '@/models/server/config';
import { db, questionCollection } from '@/models/name';
import { IconTrash } from '@tabler/icons-react';

const DeleteQuestion = ({ questionId, authorId }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this question?');
    if (!confirmed) return;

    try {
      await databases.deleteDocument(db, questionCollection, questionId);
      router.push('/questions'); // redirect to questions list after deletion
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="mt-2 rounded bg-red-600 p-2 text-white hover:bg-red-700"
      title="Delete question"
    >
      <IconTrash size={18} />
    </button>
  );
};

export default DeleteQuestion;
