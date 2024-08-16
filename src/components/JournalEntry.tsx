import React from 'react'

function JournalEntry({title, entryText}: {title: string,  entryText: string}) {

    return (

        <div className="w-1/2 pr-4 flex flex-col">
        <h3 id="entry-title" className="text-xl mb-4">{title}</h3>
        <p id="entry-text" className="mb-4">{entryText}</p>
      </div>
    )
}

export default JournalEntry