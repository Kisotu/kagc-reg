import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AdminApp } from './AdminApp.jsx'
import App from './App.jsx'

const isAdminPage = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')
const RootComponent = isAdminPage ? AdminApp : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
