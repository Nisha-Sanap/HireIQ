import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadResumePage from './pages/UploadResumePage'
import UploadJobPage from './pages/UploadJobPage'
import CandidateRankingPage from './pages/CandidateRankingPage'
import ATSAnalysisPage from './pages/ATSAnalysisPage'
import CandidateDetailsPage from './pages/CandidateDetailsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ReportsPage from './pages/ReportsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="upload-resume" element={<UploadResumePage />} />
        <Route path="upload-job" element={<UploadJobPage />} />
        <Route path="rankings/:jobId" element={<CandidateRankingPage />} />
        <Route path="ats/:jobId/:resumeId" element={<ATSAnalysisPage />} />
        <Route path="candidate/:resumeId" element={<CandidateDetailsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
