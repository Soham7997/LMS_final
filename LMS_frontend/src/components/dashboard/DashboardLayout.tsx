import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Home, User, Settings } from 'lucide-react';
import Logo from '../ui/Logo';
import StudentDashboard from './StudentDashboardNew';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import MainHeadDashboard from './MainHeadDashboard';
import ManagementDashboard from './ManagementDashboard';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'STUDENT':
        return <StudentDashboard />;
      case 'TEACHER':
        return <TeacherDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'HEAD':
        return <MainHeadDashboard />;
      case 'MANAGEMENT':
        return <ManagementDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'Student';
      case 'TEACHER':
        return 'Teacher';
      case 'ADMIN':
        return 'Administrator';
      case 'HEAD':
        return 'Head';
      case 'MANAGEMENT':
        return 'Management';
      default:
        return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo />
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  {getRoleDisplayName(user?.role || '')} Dashboard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Profile"
              >
                <User className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <img
                  src={'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getDashboardComponent()}
      </main>
    </div>
  );
};

export default DashboardLayout;