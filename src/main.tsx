import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {RouterProvider, createBrowserRouter} from 'react-router-dom'
import App from './App.tsx'
import JournalPage from './components/JournalPage.tsx'
import './index.css'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/journal/:date',
    element: <JournalPage />
  }
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider  router={router} />
  </StrictMode>,
)

