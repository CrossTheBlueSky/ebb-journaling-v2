import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import JournalEntry from "./JournalEntry";
import NotePage from "./NotePage";
import { useAuth } from "../context/AuthContext";
import { getThemeClass } from "../utils/theme-utils";
// import { ChevronLeft, ChevronRight } from "lucide-react";
import NewEntryModal from "./NewEntryModal";

const JournalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("");
  const [moodColor, setMoodColor] = useState("#00e600");
  const [entryText, setEntryText] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(state.date));
  const [imagePath, setImagePath] = useState<string | null>(null);
  const {userId, username} = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if(state.entry){
      console.log(state.entry)
      setMood(state.entry.mood_name);
      setMoodColor(state.entry.mood_color);
      setEntryText(state.entry.entry_text);
      setTitle(state.entry.title);
      setImagePath(state.entry.image_path)
    }else if(mood === "") {
      setIsModalOpen(true);
    }
  });

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
    

    try {
      const moodResponse = await fetch("/api/moods", {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json" },
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
      const submittedData = new FormData();

      submittedData.append('image', formData.get('image') as Blob);
      submittedData.append('data', JSON.stringify({

          user_id: userId,
          date: currentDate.toISOString(),
          user_mood_id: moodData.user_mood_id,
          title: formData.get("title") as string,
          entry_text: formData.get("entry") as string,

      }));


      const entryResponse = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`},
        body: submittedData
      });

      if (!entryResponse.ok) {
        const errorData = await entryResponse.json();
        throw new Error(`Failed to create/update entry: ${errorData.error || entryResponse.statusText}`);
      }

      const entryResult = await entryResponse.json();
      console.log("Entry created/updated:", entryResult);

    } catch (error) {
      console.error("Error:", error);
    }
  };


  return (
<div className={`flex flex-col h-full ${getThemeClass('background')} ${getThemeClass('text')}`}>
  {/* Header */}
  <div className={`flex flex-row justify-between ${getThemeClass('primary')} p-2`}>
    <div className="mt-2"></div>
    <div>
      <button onClick={() => navigate("/")} className={`${getThemeClass('text')} text-3xl`}>
        Back to Calendar
      </button>
    </div>
    <div className="mt-2"></div>
  </div>

  {/* Main content */}
  <div className="flex-1 p-6 flex flex-col overflow-hidden">
    <h2 className="text-2xl font-semibold mb-1">{formatDate(currentDate)}</h2>
    <div className="mb-4 mt-1 flex mx-auto">
      <span id="mood-name" className="mr-2">
        {mood}
      </span>
      <div
        id="mood-color"
        className="w-6 h-6 rounded-full"
        style={{ backgroundColor: moodColor }}
      >
      </div>
    </div>
    <div className="flex flex-1 overflow-hidden">
      {/* Left column */}
      <div className="w-1/2 pr-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {notesOpen ? (
            <NotePage entry_id={state.entry.id} />
          ) : (
            <JournalEntry title={title} entryText={entryText} />
          )}
        </div>
        <button
          className={`mt-4 ${getThemeClass('primary')} py-2 px-4 rounded`}
          onClick={() => setNotesOpen(!notesOpen)}
        >
          {notesOpen ? "Back to Entry" : "Notes"}
        </button>
      </div>

      {/* Right column*/}
      <div className={`w-1/2 ${getThemeClass('secondary')} overflow-hidden`}>
        {/* Placeholder for image */}
        {imagePath ? <img src={imagePath} alt="Placeholder" className="w-full h-full object-cover" /> :
        <div className="h-full bg-opacity-50 flex items-end">
          <div className="w-16 h-24 bg-black opacity-25 mb-4 ml-auto mr-4"></div>
        </div>}
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className={`bg-red-700 p-3 text-center`}>
    <button className={getThemeClass('text')}>Delete Entry</button>
  </div>

  {/* Modal */}
  <NewEntryModal
    isOpen={isModalOpen}
    onSubmit={handleFormSubmit}
    onClose={() => {
      setIsModalOpen(false);
      navigate('/');
    }}
  />
</div>
  );
};

export default JournalPage;