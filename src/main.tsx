import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App.tsx'
import Calendar from './components/Calendar.tsx'
import JournalPage from './components/JournalPage.tsx'
import LoginPage from './components/LoginPage.tsx'
import RegistrationPage from './components/RegistrationPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import ChartPage from './components/ChartPage.tsx'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/calendar" replace />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register', 
        element: <RegistrationPage />
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'calendar',
            element: <Calendar />
          },
          {
            path: 'journal/:date',
            element: <JournalPage />
          },
          {
            path: 'trends',
            element: <ChartPage />
          }
        ]
      },
      {
        path: "*",
        element: <Navigate to="/calendar" replace />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)