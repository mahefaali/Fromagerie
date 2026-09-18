import './App.css'
import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute'
import { OwnerOnlyRoute } from './routes/OwnerOnlyRoute'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'

const HomePage = lazy(() => import('./pages/Home/Home'))
const LoginPage = lazy(() => import('./pages/Login/Login'))
const Fabrication = lazy(() => import('./pages/Manufacturing/Manufacturing'))
const Configuration = lazy(() => import('./pages/Configuration/Configuration'))
const ProfitabilityPage = lazy(() => import('./pages/Profitability/Profitability'))
const AffinagePage = lazy(() => import('./pages/Affinage/Affinage'))
const Stock = lazy(() => import('./pages/StorageSale/StockSale'))
const TraceabilityPage = lazy(() => import('./pages/Traceability/Traceability'))

function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-[50vh] items-center justify-center px-4 text-center"
    >
      <p>Chargement de la page...</p>
    </div>
  )
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Routes réservées aux utilisateurs non authentifiés */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<LazyPage><LoginPage /></LazyPage>} />
            <Route path="/login" element={<LazyPage><LoginPage /></LazyPage>} />
          </Route>

          {/* Routes privées avec layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<LazyPage><HomePage /></LazyPage>} />
              <Route path="/fabrication" element={<LazyPage><Fabrication /></LazyPage>} />
              <Route path="/affinage" element={<LazyPage><AffinagePage /></LazyPage>} />
              <Route path="/stock" element={<LazyPage><Stock /></LazyPage>} />
              <Route path="/tracabilite" element={<LazyPage><TraceabilityPage /></LazyPage>} />
              <Route element={<OwnerOnlyRoute />}>
                <Route path="/configuration" element={<LazyPage><Configuration /></LazyPage>} />
                <Route path="/rentabilite" element={<LazyPage><ProfitabilityPage /></LazyPage>} />
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
