import React, { useState, useEffect } from 'react'
import NoteCard from './NoteCard'
import NewNoteModal from './NewNoteModal'
import { useAuth } from '../context/AuthContext';

interface NotePageProps {
  entry_id: number;
}

interface Note {
  id: number;
  text: string;
  date: Date;
}

const NotePage: React.FC<NotePageProps> = ({entry_id}) => {
 const [noteModalOpen, setNoteModalOpen] = useState(false);
 const [notes, setNotes] = useState<Note[]>([]);
 const {userId} = useAuth();
 const date = new Date()
 const token = localStorage.getItem("token");

 useEffect(() => {
  fetchNotes();
 }, [entry_id, token]);

 const fetchNotes = async () => {
   try {
     const response = await fetch(`/api/notes/${entry_id}`, {
       method: "GET",
       headers: { 
         'Authorization': `Bearer ${token}`,
         "Content-Type": "application/json" },
     });
     if (!response.ok) {
       throw new Error('Failed to fetch notes');
     }
     const data = await response.json();
     setNotes(data);
   } catch (error) {
     console.error('Error fetching notes:', error);
   }
 }

 const handleFormSubmit = async (formData: FormData) => {
  console.log(formData.get("text"), entry_id, userId, date)

  const newNote = {
    id: Date.now(),
    text: formData.get("text") as string,
    date: date
  }

  setNotes(prevNotes => [...prevNotes, newNote]);

  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { 
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        entry_id: entry_id,
        user_id: userId,
        date: date,
        text: formData.get("text"),
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    console.log('Note created successfully');
    setNoteModalOpen(false);
  } catch (error) {
    console.error('Error:', error);
    // If there's an error, remove the optimistically added note
    setNotes(prevNotes => prevNotes.filter(note => note.id !== newNote.id));
  }
 }

 const handleDeleteNote = async (noteId: number) => {
   // Optimistically remove the note from the state
   setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));

   try {
     const response = await fetch(`/api/notes/${noteId}`, {
       method: 'DELETE',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     });

     if (!response.ok) {
       throw new Error('Failed to delete note');
     }

     console.log('Note deleted successfully');
   } catch (error) {
     console.error('Error deleting note:', error);
     // If there's an error, fetch all notes again to restore the correct state
     fetchNotes();
   }
 }

 const allNoteCards = notes.map((note) => (
   <NoteCard 
     key={note.id} 
     note={note} 
     onDelete={() => handleDeleteNote(note.id)}
   />
 ));

 return(
   <div className="flex flex-col h-full">
     <div className="flex-1 overflow-y-auto mb-4">
       {allNoteCards}
     </div>
     <button
       onClick={() => setNoteModalOpen(true)}
       className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
     >
       New Note
     </button>
     
     <NewNoteModal
       isOpen={noteModalOpen}
       onSubmit={handleFormSubmit}
       onClose={() => setNoteModalOpen(false)}
     />
   </div>
 );
};

export default NotePage