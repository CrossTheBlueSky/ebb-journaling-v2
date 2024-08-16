import React, { useState, useEffect } from 'react';

const AutoOpenModal = ({condition }: { condition: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (condition) {
      setIsOpen(true);
    }
  }, [condition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Important Information</h2>
        <p className="mb-4">This modal opens automatically when the condition is met.</p>
        <button 
          onClick={() => setIsOpen(false)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

export default AutoOpenModal;