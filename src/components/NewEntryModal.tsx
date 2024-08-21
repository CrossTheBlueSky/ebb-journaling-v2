import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NewEntryModalProps {
  isOpen: boolean;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
}

const NewEntryModal: React.FC<NewEntryModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [moodColor, setMoodColor] = useState("#00e600");
  const [entry, setEntry] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setTitle('');
      setMood('');
      setEntry('');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();


    //values from form
    const formData = new FormData();
    formData.append('title', title);
    formData.append('mood', mood);
    formData.append('entry', entry);
    formData.append('moodColor', moodColor);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <form id="new-entry-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter title"
              required
            />
          </div>
          <div>
            <label htmlFor="mood" className="block text-gray-700 text-sm font-bold mb-2">
              Mood
            </label>
            <input id="mood-color" type="color" 
            onChange={(e)=>{
              setMoodColor(e.target.value)
            }}
            className="w-full" 
            defaultValue="#00e600" />
            <input
              type="text"
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter keyword"
              required
            />
          </div>
          <div>
            <label htmlFor="entry" className="block text-gray-700 text-sm font-bold mb-2">
              Entry
            </label>
            <textarea
              id="entry"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              placeholder="Write your journal entry here"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="image-upload" className="block text-gray-700 text-sm font-bold mb-2">
              Image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {previewUrl && (
              <div className="mt-4">
                <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg shadow-md" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Entry
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryModal;