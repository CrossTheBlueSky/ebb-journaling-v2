import React from 'react'

function JournalEntry({title, mood, entryText, date}: {title: string, mood: string, entryText: string, date: string}) {

    return (

        <div className="w-1/2 pr-4 flex flex-col">
        <h3 className="text-xl mb-4">{title}</h3>
        <p className="mb-4">{entryText}</p>
      </div>
    )
}

export default JournalEntry