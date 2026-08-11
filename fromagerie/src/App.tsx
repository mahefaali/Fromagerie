import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout';
import HomePage from './pages/Home/Home'
import LoginPage from './pages/Login/Login'
import Fabrication from './pages/Manufacturing/Manufacturing'
import Configuration from './pages/Configuration/Configuration'
import AffinagePage from './pages/Affinage/Affinage'
import Stock from './pages/StorageSale/StockSale'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes sans layout */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Routes avec layout */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/fabrication" element={<Fabrication />} />
          <Route path="/affinage" element={<AffinagePage />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/configuration" element={<Configuration />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
