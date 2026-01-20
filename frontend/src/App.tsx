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
import AsimListesiPage from './pages/AsimListesiPage'
import CustomerRequestsPage from './pages/CustomerRequestsPage'
import SettingsPage from './pages/SettingsPage'
import SalesPage from './pages/SalesPage'
import ReservationsPage from './pages/ReservationsPage'
import CostSettingsPage from './pages/CostSettingsPage'
import ContractsPage from './pages/ContractsPage'
import IncomingCallsPage from './pages/IncomingCallsPage'

// Layout
import MainLayout from './components/layout/MainLayout'

// Toast
import ToastContainer from './components/ToastContainer'
import { useToast } from './hooks/useToast'

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
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('user'))
    const { toasts, removeToast } = useToast()

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
                                <MainLayout onLogout={() => {
                                    localStorage.removeItem('user')
                                    localStorage.removeItem('userId')
                                    setIsAuthenticated(false)
                                }} /> :
                                <Navigate to="/login" replace />
                        }
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="sales" element={<SalesPage />} />
                        <Route path="reservations" element={<ReservationsPage />} />
                        <Route path="clients" element={<ClientsPage />} />
                        <Route path="customer-requests" element={<CustomerRequestsPage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route path="proposals" element={<ProposalsPage />} />
                        <Route path="asim-listesi" element={<AsimListesiPage />} />
                        <Route path="contracts" element={<ContractsPage />} />
                        <Route path="incoming-calls" element={<IncomingCallsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="cost-settings" element={<CostSettingsPage />} />

                        {/* Redirect tasks to inventory for now */}
                        <Route path="tasks" element={<Navigate to="/inventory" replace />} />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>

                {/* Global Toast Notifications */}
                <ToastContainer toasts={toasts} onRemove={removeToast} />
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
