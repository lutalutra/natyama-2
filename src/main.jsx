import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Studio from './pages/Studio.jsx'
import Archive from './pages/Archive.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
<BrowserRouter basename="/natyama-2">
  <Routes>
    ...
  </Routes>
</BrowserRouter>
  </React.StrictMode>,
)
