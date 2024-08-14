import React from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'



const JournalPage: React.FC  = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const {state} = location
    const title = "Placeholder Title"
    const mood = "Placeholder Mood"
    const date = formatDate(state.date)
    const entryText = "Placeholder Entry"

    //Convert date route to verbose string
    function formatDate(dateString: string): string {
        const [month, day, year] = dateString.split('_').map(Number);
        
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
      
        const getDaySuffix = (day: number): string => {
          if (day >= 11 && day <= 13) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };
      
        const formattedMonth = monthNames[month - 1];
        const formattedDay = `${day}${getDaySuffix(day)}`;
      
        return `${formattedMonth} ${formattedDay}, ${year}`;
      }

    return(

            <div className="flex flex-col h-full bg-teal-800 text-white">
              {/* Header */}
              <div className="bg-orange-400 p-3 text-center">
                <button onClick={() => navigate(-1)} className="text-white">Back to Calendar</button>
              </div>
              
              {/* Main content */}
              <div className="flex-1 p-6 flex flex-col">
                <h2 className="text-2xl font-semibold mb-1">{date}</h2>
                <div className="mb-4 mt-1 flex mx-auto">
                      <span className="mr-2">{mood}</span>
                      {/* TODO: UPDATE COLOR BOX */}
                      <div className="w-6 h-6 bg-yellow-200"></div>
                </div>
                <div className="flex flex-1">
                  {/* Left column */}
                  <div className="w-1/2 pr-4 flex flex-col">
                    <h3 className="text-xl mb-4">{title}</h3>
                    <p className="mb-4">{entryText}</p>
                    <button className="mt-auto bg-orange-400 text-white py-2 px-4 rounded">
                      Notes
                    </button>
                  </div>
                  
                  {/* Right column - Image placeholder */}
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
            </div>
          );
        };
        

export default JournalPage
