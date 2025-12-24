import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import ProjectsPage from './pages/ProjectsPage'
import InventoryPage from './pages/InventoryPage'
import ProposalsPage from './pages/ProposalsPage'
import ReportsPage from './pages/ReportsPage'

// Layout
import MainLayout from './components/layout/MainLayout'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ?
                                <Navigate to="/dashboard" replace /> :
                                <LoginPage onLogin={() => setIsAuthenticated(true)} />
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            isAuthenticated ?
                                <MainLayout onLogout={() => setIsAuthenticated(false)} /> :
                                <Navigate to="/login" replace />
                        }
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="clients" element={<ClientsPage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route path="proposals" element={<ProposalsPage />} />
                        <Route path="reports" element={<ReportsPage />} />

                        {/* Redirect tasks to inventory for now */}
                        <Route path="tasks" element={<Navigate to="/inventory" replace />} />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
