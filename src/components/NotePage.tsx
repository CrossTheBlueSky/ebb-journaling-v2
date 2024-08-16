import React from 'react'
import NoteCard from './NoteCard'
import NewNoteModal from './NewNoteModal'


const NotePage: React.FC  = () => {
 const [noteModalOpen, setNoteModalOpen] = React.useState(false);

      

    return(
        <>
            <button onClick={()=>{
                setNoteModalOpen(true)}}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                New Note
            </button>
            <NewNoteModal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} />
        </>
          );
        };
        

export default NotePage
