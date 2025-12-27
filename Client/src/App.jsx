// App.jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import EquipmentList from './components/Equipment/EquipmentList';
import RequestList from './components/Requests/RequestList';
import KanbanBoard from './components/Requests/KanbanBoard';
import CalendarView from './components/Requests/CalendarView';
import TeamList from './components/Teams/TeamList';
import UserList from './components/Users/UserList';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 mt-[73px]">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/equipment" element={<EquipmentList />} />
            <Route path="/requests" element={<RequestList />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/teams" element={<TeamList />} />
            <Route path="/users" element={<UserList />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;