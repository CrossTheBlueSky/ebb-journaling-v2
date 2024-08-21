import React from 'react'

interface NoteCardProps {
        note: {
                id: number;
                text: string;
                date: string;
        };
    }

const NoteCard: React.FC<NoteCardProps> = ({note}) => {

        return(
            <div className="border-solid border-2 mb-3">
            <div className="flex flex-col mx-4 py-2">
              <h2 className="text-xl"><strong>{note.date}</strong></h2>
              <div>
                <p>{note.text}</p>
              </div>

              {/* TODO: Add delete logic*/}
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold mt-4 mb-1 py-2 px-4 self-center rounded">
                Delete Note
              </button>
            </div>
          </div>
        );
}

export default NoteCard