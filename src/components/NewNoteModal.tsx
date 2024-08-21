import React, { useState } from 'react';

interface NewNoteModalProps {
  isOpen: boolean;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
}

const NewNoteModal: React.FC<NewNoteModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('text', note);
    onSubmit(formData);
    onClose();
  }



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div className="max-w-md mx-auto mt-8">
          <form onSubmit={handleSubmit} className="">
            <div className="mb-6">
              <label htmlFor="note" className="block text-gray-700 text-sm font-bold mb-2">
                Add Note
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                placeholder="Write your journal entry here"
                required
              ></textarea>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Note
              </button>
              <button 
                type="button"
                onClick={onClose}  
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewNoteModal;