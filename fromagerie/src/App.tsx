import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/Home/Home'
import LoginPage from './pages/Login/Login'
import Fabrication from './pages/Manufacturing/Manufacturing'
import Configuration from './pages/Configuration/Configuration'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/fabrication" element={<Fabrication />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
