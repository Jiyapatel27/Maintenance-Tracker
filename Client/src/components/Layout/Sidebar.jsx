// src/components/Layout/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Package, 
  Users, 
  Wrench, 
  Calendar, 
  UserCircle,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigation = () => {
    const baseNav = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        path: '/dashboard', 
        roles: ['admin', 'manager', 'technician', 'employee'] 
      }
    ];

    const roleNav = {
      admin: [
        { id: 'equipment', label: 'Equipment', icon: Package, path: '/equipment' },
        { id: 'teams', label: 'Teams', icon: Users, path: '/teams' },
        { id: 'users', label: 'Users', icon: UserCircle, path: '/users' },
        { id: 'requests', label: 'Requests', icon: Wrench, path: '/requests' }
      ],
      manager: [
        { id: 'requests', label: 'Requests', icon: Wrench, path: '/requests' },
        { id: 'kanban', label: 'Kanban Board', icon: BarChart3, path: '/kanban' },
        { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
        { id: 'equipment', label: 'Equipment', icon: Package, path: '/equipment' }
      ],
      technician: [
        { id: 'kanban', label: 'My Tasks', icon: Wrench, path: '/kanban' },
        { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' }
      ],
      employee: [
        { id: 'requests', label: 'My Requests', icon: Wrench, path: '/requests' }
      ]
    };

    return [...baseNav, ...(roleNav[user?.role] || [])];
  };

  const navigation = getNavigation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static top-0 left-0 z-40 w-64 bg-white border-r border-gray-200 h-screen transition-transform duration-300 ease-in-out overflow-y-auto pt-[65px]`}
      >
        <nav className="p-4 space-y-2 pb-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;