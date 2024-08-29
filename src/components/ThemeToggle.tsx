import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getThemeClass } from '../utils/theme-utils';

const ThemeToggle = () => {


  const { isDarkMode, toggleTheme } = useTheme();

  if(isDarkMode){
    document.body.style.backgroundColor = "#1e293b";
  }else{
    document.body.style.backgroundColor = "#fffbeb";
  }

      return (

        <button
        onClick={toggleTheme}
        className={`p-2 fixed top-2 right-8 rounded-full ${getThemeClass('secondary')}`}
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      )

}

export default ThemeToggle