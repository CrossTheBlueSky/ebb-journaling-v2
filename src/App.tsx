import { AuthProvider } from './context/AuthContext'
import { Outlet } from 'react-router-dom'
import ThemeToggle from './components/ThemeToggle'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'
import './index.css'

function App() {



  return (
    <ThemeProvider>
    <AuthProvider>
        <ThemeToggle />
        <Outlet />
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
