import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ViewMenuScreen } from './screens/ViewMenuScreen';
import { MakeReservationScreen } from './screens/MakeReservationScreen';
import { EarnPointsScreen } from './screens/EarnPointsScreen';
import { ViewRewardsScreen } from './screens/ViewRewardsScreen';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomeScreen />
          </ProtectedRoute>
        } />
          <Route path="/menu" element={<ViewMenuScreen />} />
          <Route path="/reserve" element={<MakeReservationScreen />} />
          <Route path="/earn" element={<EarnPointsScreen />} />
          <Route path="/rewards" element={<ViewRewardsScreen />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        } />
      </Routes>
      {user && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
