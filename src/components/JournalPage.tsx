import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import JournalEntry from "./JournalEntry";
import NotePage from "./NotePage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NewEntryModal from "./NewEntryModal";

const JournalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [title, setTitle] = useState("Placeholder Title");
  const [mood, setMood] = useState("Placeholder Mood");
  const [moodColor, setMoodColor] = useState("#00e600");
  const [entryText, setEntryText] = useState("Placeholder Entry");
  const [notesOpen, setNotesOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(state.date));

  useEffect(() => {
    console.log(currentDate, state.date)
    if (mood === "Placeholder Mood") {
      setIsModalOpen(true);
    }
  }, [mood]);

  function formatDate(date: Date): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const getDaySuffix = (day: number): string => {
      if (day >= 11 && day <= 13) return "th";
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    const formattedMonth = monthNames[date.getMonth()];
    const formattedDay = `${date.getDate()}${getDaySuffix(date.getDate())}`;
    return `${formattedMonth} ${formattedDay}, ${date.getFullYear()}`;
  }

  const handleFormSubmit = async (formData: FormData) => {
    setTitle(formData.get("title") as string);
    setMood(formData.get("mood") as string);
    setEntryText(formData.get("entry") as string);
    setMoodColor(formData.get("moodColor") as string);
    setIsModalOpen(false);

    const userId = 1; // Placeholder for user ID

    try {
      const moodResponse = await fetch("http://localhost:5000/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("mood"),
          user_id: userId,
          color: formData.get("moodColor"),
        }),
      });

      if (!moodResponse.ok) {
        const errorData = await moodResponse.json();
        throw new Error(`Failed to create/fetch mood: ${errorData.error || moodResponse.statusText}`);
      }

      const moodData = await moodResponse.json();
      console.log("Mood data:", moodData);

      const imageFile = formData.get("image") as File;
      if (imageFile) {
        console.log("image found. You should actually handle these at some point, DEREK")
      }

      const entryResponse = await fetch("http://localhost:5000/api/entries", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: userId,
            date: currentDate.toISOString(),
            user_mood_id: moodData.user_mood_id,
            title: formData.get("title") as string,
            entry_text: formData.get("entry") as string
        })
      });

      if (!entryResponse.ok) {
        const errorData = await entryResponse.json();
        throw new Error(`Failed to create/update entry: ${errorData.error || entryResponse.statusText}`);
      }

      const entryResult = await entryResponse.json();
      console.log("Entry created/updated:", entryResult);

    } catch (error) {
      console.error("Error:", error);
      // Additional error handling can be added here
    }
  };

  const pageTurnHandler = (value: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + value);
    setCurrentDate(newDate);
    navigate(`/journal/${formatDateForURL(newDate)}`, { state: { date: newDate } });
  };

  const formatDateForURL = (date: Date): string => {
    return `${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`;
  };

  return (
    <div className="flex flex-col h-full bg-teal-800 text-white">
      {/* Header */}
      <div className="flex flex-row justify-between bg-orange-400 p-2">
        <div className="mt-2">
          <button onClick={() => pageTurnHandler(-1)} className="text-white">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div>
          <button onClick={() => navigate("/")} className="text-white text-3xl">
            Back to Calendar
          </button>
        </div>
        <div className="mt-2">
          <button onClick={() => pageTurnHandler(1)} className="text-white">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col">
        <h2 className="text-2xl font-semibold mb-1">{formatDate(currentDate)}</h2>
        <div className="mb-4 mt-1 flex mx-auto">
          <span id="mood-name" className="mr-2">
            {mood}
          </span>
          <div
            id="mood-color"
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: moodColor }}
          ></div>
        </div>
        <div className="flex flex-1">
          {/* Left column */}
          <div className="w-1/2 pr-4 flex flex-col">
            {notesOpen ? (
              <NotePage entryDate={formatDate(currentDate)} />
            ) : (
              <JournalEntry title={title} entryText={entryText} />
            )}
            <button
              className="mt-auto bg-orange-400 text-white py-2 px-4 rounded"
              onClick={() => setNotesOpen(!notesOpen)}
            >
              {notesOpen ? "Back to Entry" : "Notes"}
            </button>
          </div>

          {/* Right column*/}
          <div className="w-1/2 bg-blue-600">
            {/* Placeholder for image */}
            <div className="h-full bg-opacity-50 flex items-end">
              <div className="w-16 h-24 bg-black opacity-25 mb-4 ml-auto mr-4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-purple-900 p-3 text-center">
        <button className="text-white">Delete Entry</button>
      </div>

      {/* Modal */}
      <NewEntryModal
        isOpen={isModalOpen}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setIsModalOpen(false)
          navigate('/')
        }}
      />
    </div>
  );
};

export default JournalPage;