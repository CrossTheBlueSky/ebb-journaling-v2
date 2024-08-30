import React from 'react'

function JournalEntry({title, entryText}: {title: string,  entryText: string}) {

    return (

      <div className="w-full max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
        <div className="overflow-y-auto max-h-[300px] pr-2">
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{entryText}</p>
        </div>
      </div>
    </div>
    )
}

export default JournalEntry