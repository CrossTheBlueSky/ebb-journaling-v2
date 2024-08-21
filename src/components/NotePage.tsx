import React from 'react'
import NoteCard from './NoteCard'
import NewNoteModal from './NewNoteModal'

interface NotePageProps {
  entryDate: string;
}

const NotePage: React.FC<NotePageProps>  = ({entryDate}) => {
 const [noteModalOpen, setNoteModalOpen] = React.useState(false);
 const user_id= 1 //still using a placeholder for now
 const entry_id = 1 //placeholder for the backend as well
 const date = new Date()


 const handleFormSubmit = async (formData: FormData) => {
  console.log(entryDate)

 fetch("http://localhost:5000/api/moods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user_id,
      entry_id: entry_id,
      date: date,
      text: formData.get("text"),
    }),
  });

  setNoteModalOpen(false);

}

      

    return(
        <>
            <button onClick={()=>{
                setNoteModalOpen(true)}}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                New Note
            </button>
            <NewNoteModal isOpen={noteModalOpen} onSubmit={handleFormSubmit} onClose={() => setNoteModalOpen(false)} />
        </>
          );
        };
        

export default NotePage
