// Dashboard Service
// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Package, Wrench, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your maintenance operations
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          value={stats?.overview?.totalEquipment || 0}
          label="Total Equipment"
          color="blue"
        />
        <StatCard
          icon={Wrench}
          value={stats?.overview?.activeRequests || 0}
          label="Active Requests"
          color="purple"
        />
        <StatCard
          icon={AlertCircle}
          value={stats?.overview?.overdueRequests || 0}
          label="Overdue Tasks"
          color="red"
        />
        <StatCard
          icon={CheckCircle}
          value={stats?.overview?.completedRequests || 0}
          label="Completed"
          color="green"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Requests</h3>
          <div className="space-y-3">
            {stats?.recentRequests?.slice(0, 5).map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{request.subject}</p>
                  <p className="text-sm text-gray-600">
                    {request.equipmentId?.name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'new'
                      ? 'bg-blue-100 text-blue-700'
                      : request.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {request.status.toUpperCase()}
                </span>
              </div>
            ))}
            {(!stats?.recentRequests || stats.recentRequests.length === 0) && (
              <p className="text-gray-500 text-center py-8">No recent requests</p>
            )}
          </div>
        </div>

        {/* Equipment by Category */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Equipment by Category
          </h3>
          <div className="space-y-3">
            {stats?.equipmentByCategory?.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <span className="font-semibold text-gray-900">{item._id}</span>
                <span className="text-2xl font-bold text-blue-600">{item.count}</span>
              </div>
            ))}
            {(!stats?.equipmentByCategory ||
              stats.equipmentByCategory.length === 0) && (
              <p className="text-gray-500 text-center py-8">No equipment data</p>
            )}
          </div>
        </div>
      </div>

      {/* Requests by Team */}
      {stats?.requestsByTeam && stats.requestsByTeam.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Active Requests by Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.requestsByTeam.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{item.teamIcon}</span>
                  <h4 className="font-bold text-gray-900">{item.teamName}</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600">{item.count}</p>
                <p className="text-sm text-gray-600">Active requests</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 opacity-80" />
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-white/80 text-sm font-medium">{label}</p>
    </div>
  );
};

export default Dashboard;