import React, { JSX } from 'react';
import './styles/globals.css';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { Admin } from './pages/AdminPage';  
import { Dashboard } from './pages/DashboardPage';
import { Header } from './components/Header';
import { SensorCard } from './components/SensorCard';
import { WaterClassificationPanel } from './components/WaterClassificationPanel';
import { AIPredictionPanel } from './components/AIPredictionPanel';
import { TrendCharts } from './components/TrendCharts';
import { MapVisualization } from './components/MapVisualization';
import { AlertsPanel } from './components/AlertsPanel';
import { SystemArchitecture } from './components/SystemArchitecture';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { Droplet, Thermometer, Zap, Eye, Wind, Waves } from 'lucide-react';
import Predict from './components/Predict';
import PredictTable from './components/PredictTable';

// check authorize
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = document.cookie.includes('user_session'); // Check for cookie
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// check role
const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = document.cookie.includes('user_session');
    const isAdmin = document.cookie.includes('user_role=admin');
    
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    
    return children;
};

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Route for Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Route for User -> MainPage (Dashboard) */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Route for Admin */}
                <Route path="/admin" element={
                    <AdminProtectedRoute>
                        {/* <Dashboard /> */}
                        <Admin />
                    </AdminProtectedRoute>} />

                {/* Chuyển hướng các đường dẫn lạ về trang chính */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}
