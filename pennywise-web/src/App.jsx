// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import AuthScreen from './screens/AuthScreen';
import MainLayout from './components/MainLayout';
import DashboardHome from './screens/DashboardHome';
import GoalsPage from './screens/GoalsPage';
import SubscriptionsPage from './screens/SubscriptionsPage';
import SettlementsPage from './screens/SettlementsPage';
import CommunityScreen from './screens/CommunityScreen';
import ProfilePage from './screens/ProfilePage';

function AppRouter() {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-neon-green">Loading session...</div>;
    }
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
                
                {/* Authenticated Routes wrapped in Tabbed MainLayout */}
                {user ? (
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/goals" element={<GoalsPage />} />
                        <Route path="/subscriptions" element={<SubscriptionsPage />} />
                        <Route path="/settlements" element={<SettlementsPage />} />
                        <Route path="/community" element={<CommunityScreen />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                ) : (
                    <Route path="*" element={<Navigate to="/auth" />} />
                )}
            </Routes>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <FinanceProvider>
                <AppRouter />
            </FinanceProvider>
        </AuthProvider>
    );
}
