import React from 'react'
import { Trash2 } from 'lucide-react'

interface NoteCardProps {
  note: {
    id: number;
    text: string;
    date: string;
  };
  onDelete: (id: number) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  return (
    <div className="bg-white w-11/12 shadow-md rounded-lg overflow-hidden mb-4 transition-all duration-300 hover:shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 font-medium">
            <strong>{formatDate(note.date)}</strong>
          </span>
          <button 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors duration-300"
            aria-label="Delete note"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
      </div>
    </div>
  );
}

export default NoteCard