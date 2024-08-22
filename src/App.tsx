import { AuthProvider } from './context/AuthContext'
import { Outlet } from 'react-router-dom'
import './App.css'
import './index.css'

function App() {

  return (
    <AuthProvider>
        <Outlet />
    </AuthProvider>
  )
}

export default App
