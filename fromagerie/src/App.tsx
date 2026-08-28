import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from './layouts/AppLayout';
import HomePage from './pages/Home/Home'
import LoginPage from './pages/Login/Login'
import Fabrication from './pages/Manufacturing/Manufacturing'
import Configuration from './pages/Configuration/Configuration'
import AffinagePage from './pages/Affinage/Affinage'
import Stock from './pages/StorageSale/StockSale'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { OwnerOnlyRoute } from './routes/OwnerOnlyRoute'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Routes réservées aux utilisateurs non authentifiés */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Routes privées avec layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/fabrication" element={<Fabrication />} />
              <Route path="/affinage" element={<AffinagePage />} />
              <Route path="/stock" element={<Stock />} />
              <Route element={<OwnerOnlyRoute />}>
                <Route path="/configuration" element={<Configuration />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton expand visibleToasts={5} duration={4000} />
    </>
  )
}

export default App
