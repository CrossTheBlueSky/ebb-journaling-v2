import React, { useState, useEffect } from 'react'
import NoteCard from './NoteCard'
import NewNoteModal from './NewNoteModal'

interface NotePageProps {
  entry_id: number;
}

const NotePage: React.FC<NotePageProps>  = ({entry_id}) => {
 const [noteModalOpen, setNoteModalOpen] = React.useState(false);
 const [notes, setNotes] = useState([]);
 const user_id= 1 //still using a placeholder for now
 const date = new Date()

 useEffect(() => {
  console.log(entry_id)
    fetch(`http://localhost:5000/api/notes/${entry_id}`)
    .then(response => response.json())
    .then(data => setNotes(data))
    .catch(error => console.error(error));
  }, []);

 const handleFormSubmit = async (formData: FormData) => {
  console.log(formData.get("text"), entry_id, user_id, date)


 fetch("http://localhost:5000/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entry_id: entry_id,
      user_id: user_id,
      date : date,
      text: formData.get("text"),
    }),
  })
  .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    console.log('Success:', data);
})
.catch((error) => {
    console.error('Error:', error);
});

  setNoteModalOpen(false);

}

const allNoteCards = notes.map((note) => <NoteCard key={note.id} note={note} />);

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
